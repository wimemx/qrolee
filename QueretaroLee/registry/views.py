# -*- coding: utf-8 -*-
from _mysql import connection
from operator import attrgetter
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import auth
from django.contrib.auth import models as auth_models
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.utils.timezone import utc
from django.db import models as db_model
from django.db.models.loading import get_model
from django.core.mail import send_mail
from django.core.mail import EmailMessage
from django.template import Context
from django.template.loader import get_template

from account import models as account
from registry import models, settings
from decimal import Decimal
from QueretaroLee import settings as main_settings


import calendar
import urllib2
import os
import urlparse
import urllib
import ast
import simplejson
import oauth2
import hashlib
import HTMLParser
import datetime
from xml.dom import minidom


def index(request, **kwargs):
    error = ''
    if request.GET:

        if 'code' in request.GET:
            args = {
                'client_id': settings.FACEBOOK_APP_ID,
                'redirect_uri': settings.FACEBOOK_REDIRECT_URI,
                'client_secret': settings.FACEBOOK_API_SECRET,
                'code': request.GET['code'],
            }
            url = 'https://graph.facebook.com/' \
                  'oauth/access_token?'+urllib.urlencode(args)
            response = urlparse.parse_qs(urllib.urlopen(url).read())
            access_token = response['access_token'][0]
            expires = response['expires'][0]
            facebook_session = models.FacebookSession.objects.get_or_create(
                access_token=access_token,
            )[0]

            facebook_session.expires = expires
            facebook_session.save()

            user = auth.authenticate(token=access_token)
            if user:
                auth.login(request, user)
                return HttpResponseRedirect('/qro_lee/')
            else:
                error = 'AUTH_FAILED'
        elif 'twitter_login' in request.GET:
            consumer = oauth2.Consumer(settings.TWITTER_KEY, settings.TWITTER_SECRET)
            client = oauth2.Client(consumer)
            resp, content = client.request(
                settings.TWITTER_REQUEST_URL,
                "POST", body=urllib.urlencode({
                    'oauth_callback': settings.TWITTER_REDIRECT}))

            if resp['status'] != '200':
                raise Exception("Invalid response from Twitter.")
            request_token = dict(urlparse.parse_qsl(content))
            url = "%s?oauth_token=%s" % (settings.TWITTER_AUTH_URL,
                                         request_token['oauth_token'])
            twitterSession = models.TwitterSession.objects.create(
                oauth_token=request_token['oauth_token'],
                request_token=request_token)
            twitterSession.save()
            return HttpResponseRedirect(url)
        elif 'oauth_token' in request.GET:
            twitterSessionObj = models.TwitterSession.objects.get(
                oauth_token=request.GET['oauth_token'])
            request_token = ast.literal_eval(twitterSessionObj.request_token)
            user = auth.authenticate(oauth_verifier=request.GET['oauth_verifier'],
                                     request_token=request_token)
            if user:
                if user.is_active:
                    auth.login(request, user)
                    return HttpResponseRedirect('/qro_lee/')
                else:
                    error = 'AUTH_DISABLED'
            else:
                error = 'AUTH_FAILED'
    if request.user.is_authenticated():
        return HttpResponseRedirect('/qro_lee/')
    template = kwargs['template_name']
    context = {
        'settings': settings,
        'error': error,
        'home': 'True'
    }
    return render(request, template, context)


def login(request):
    username = request.POST.get('username', '')
    password = request.POST.get('password', '')
    user = auth.authenticate(username=username, password=password)

    if user is not None:
        active = models.User.objects.get(id=user.id)
        active = active.is_active

        if active:
            if user is not None:
                user_profile = models.Profile.objects.get(user_id=user.id)
                user_profile.social_session = 0
                user_profile.save()
                auth.login(request, user)
                success = 'True'
                url = main_settings.SITE_URL+'qro_lee/'
            else:
                success = 'False'
                url = 'Error en algun campo'

        context = {
            'success': success,
            'url': url
        }
    else:
        context = {
            'success': False,
            'url': 'Error en algun campo'
        }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def account_register(request):
    user = dict(request.POST)
    url = ''
    user['first_name'][0] = user['first_name'][0].encode('utf-8')
    user['last_name'][0] = user['last_name'][0].encode('utf-8')
    user['username'][0] = user['username'][0].encode('utf-8')
    user_exits = auth_models.User.objects.filter(
        Q(email=user['email'][0]) | Q(username=user['username'][0]))

    if user['password'] != user['password_match']:
        success = 'False'

    else:

        if user_exits:
            success = 'False'
            url = 'Usuario ya existente'
        else:
            password_md5 = hashlib.md5(request.POST.get('password')).hexdigest()
            redirect_create = int(request.POST.get('redirect-create'))
            redirect = request.POST.get('redirect')
            del user['password']
            del user['password_match']
            del user['csrfmiddlewaretoken']
            del user['redirect-create']
            del user['redirect']
            user['password'] = password_md5

            for key, value in user.iteritems():
                copy = dict(user)
                if len(value) <= 1:
                    copy[key] = str(value[0])
                user = copy


            user = auth_models.User.objects.create(**user)
            user.save()
            create_default_list(user)
            profile = models.Profile.objects.create(user_id=user.id)
            profile.phone = ''
            profile.social_session = 0
            profile.save()
            path = os.path.join(os.path.dirname(__file__), '..', 'static/media/users').replace('\\','/')
            os.mkdir(path+'/'+str(user.id), 0777)
            os.mkdir(path+'/'+str(user.id)+'/profile/', 0777)
            os.mkdir(path+'/'+str(user.id)+'/entity/', 0777)
            os.mkdir(path+'/'+str(user.id)+'/event/', 0777)
            os.mkdir(path+'/'+str(user.id)+'/list/', 0777)
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            auth.login(request, user)
            success = 'True'
            url = main_settings.SITE_URL+'accounts/users/edit_profile/' + str(user.id)
            if redirect_create != 0:
                if redirect == 'organization':
                    url = main_settings.SITE_URL+'registry/register_entity/organization/#redirect'
                else:
                    url = main_settings.SITE_URL+'registry/register_entity/group/#redirect'

    context = {
        'success': success,
        'url': url
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


@login_required(login_url='/')
def register_entity(request, **kwargs):
    template = kwargs['template_name']
    entity_type = kwargs['entity_type']
    categories = models.Category.objects.filter(
        type__name=entity_type)
    user_profile = models.Profile.objects.get(
        user_id=request.user.id)

    if entity_type == 'group':
        entity_type = ['Crear un nuevo grupo de lectura', 'group', 'grupo']
        content = ' Los lugares son espacios en Querétaro donde puedes se pueden llevar' \
              ' acabo actividades en torno a la lectura. Llena los campos que se ' \
              'presentan a continuación para registrar un lugar en Querétaro Lee.'

    elif entity_type == 'organization':
        entity_type = ['Crear una nueva organización', 'organization', 'organización']
        content = 'Llena los campos que se presentan a continuación para registrar ' \
              'una organización en Querétaro Lee.'

    elif entity_type == 'spot':
        entity_type = ['Crear un nuevo lugar', 'spot', 'lugar']
        content = 'Llena los campos que se presentan a continuación para registrar un' \
              ' lugar en Querétaro Lee.'

    context = {
        'social_session': user_profile.social_session,
        'entity_type': entity_type,
        'content': content,
        'categories': categories

    }
    return render(request, template, context)


def register(request):
    user = request.user
    entity = dict(request.POST)
    type = models.Type.objects.get(name=entity['entity_type'][0])
    # category = models.Category.objects.get(name=entity['category_id'][0])
    entity['user_id'] = int(user.id)
    entity['type_id'] = int(type.id)
    category_ids = entity['category_ids'][0].split(' ')
    cat_ids = list()
    redirect = False
    if int(entity['redirect'][0]) == 1:
        redirect = True
    for ele in category_ids:
        cat_ids.append(int(ele))

    if entity['privacy'][0] == 'publica':
        entity['privacy'] = 0
    else:
        entity['privacy'] = 1
    del entity['csrfmiddlewaretoken']
    del entity['entity_type']
    del entity['fb_id']
    del entity['category_ids']
    del entity['redirect']
    succuess = ''

    if request.FILES:
        folder = '/entity/'
        path_extension = str(request.user.id)+folder
        path = os.path.join(
            os.path.dirname(__file__), '..',
            'static/media/users/'+path_extension).replace('\\', '/')

        path += str(request.FILES['file'])
        file = request.FILES['file']
        handle_uploaded_file(path, file)
        entity['cover_picture'] = file

    copy = entity
    for e, val in entity.iteritems():
        if isinstance(val, list):
            copy[e] = val[0]
    entity = copy
    entity = models.Entity.objects.create(**entity)
    entity.save()
    if cat_ids:
        for ele in cat_ids:
            entity_cat = models.EntityCategory.objects.create(
                entity_id=entity.id, category_id=ele)
    if entity is not None:
        if redirect:
            succuess = request.user.id
        else:
            succuess = entity.id
        dict_ = {
            'super_user': 1,
            'is_admin': 1,
            'is_member': 1,
            'object': entity.id,
            'object_type': 'E',
            'user': user
        }
        super_user = models.MemberToObject.objects.create(**dict_)
        super_user.save()
        activity_data = {
            'user_id': request.user.id,
            'object': entity.id,
            'added_to_object': request.user.id,
            'type': 'E',
            'added_to_type': 'U',
            'activity_id': 1
        }
        update_activity(activity_data)
    else:
        succuess = 'False'
    context = {
        'success': succuess
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def edit_entity(request, **kwargs):
    template = kwargs['template_name']
    id_entity = int(kwargs['entity'])
    user = request.user
    entity = models.Entity.objects.filter(id=id_entity)
    admins_list = list()
    admins = models.MemberToObject.objects.filter(
        object=id_entity, object_type='E', is_admin=True)
    for a in admins:
        admins_list.append(a.user_id)

    if entity:
        match = 0
        for ele in admins_list:
            if request.user.id == ele:
                match += 1
        if match == 0:
            return not_found(request)

        entity = models.Entity.objects.get(
            pk=id_entity)

        entity_type = models.Type.objects.get(
            entity__id=entity.id)
        if entity_type.name == 'group':
            entity_type = ['del grupo', 'group']
        elif entity_type.name == 'organization':
            entity_type = ['de la organizacion', 'organization']
        elif entity_type.name == 'spot':
            entity_type = ['del spot', 'spot']

        context = {
            'entity': entity,
            'entity_type': entity_type
        }
        return render(request, template, context)
    else:
        return not_found(request)


def delete_entity(request, **kwargs):
    if request.POST:
        app = str(request.POST.get('type')).split('.')
        app_label = app[0]
        model_name = app[1]
        model = get_model(app_label, model_name)
        if 'is_event' in request.POST:
            event = models.Event.objects.get(
                id=int(request.POST.get('id')))
            obj = model.objects.get_or_create(
                event=event,
                user=request.user)
            obj = obj[0]
            obj.is_attending = True
            obj.save()
        elif 'is_new' in request.POST:
            obj = models.Profile.objects.get(
                user_id=request.user.id)
            obj.is_new = False
        else:
            obj = model.objects.get_or_create(
                id=int(request.POST.get('id')))
            obj = obj[0]
            obj.status = False
        obj.save()
        context = {

        }
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')

    id_entity = int(kwargs['entity'])
    entity = models.Entity.objects.get(id=id_entity)
    entity.status = False
    entity.save()
    list_events = models.Event.objects.filter(location_id=id_entity).\
        update(status=False)

    return HttpResponseRedirect("/qro_lee/entities/"+kwargs['entity_type'])


def update_entity(request, **kwargs):
    field = request.POST.get('field')
    value = request.POST.get('value')
    if field == 'privacy':
        if value == 'Publica':
            value = 0
        else:
            value = 1
    elif field == 'share_fb' or field == 'share_twitter':
        value = int(value)
    elif field == 'start_time' or field == 'end_time':
        value = datetime_from_str(value)
        value = value[1]
    dictionary = {
        field: value
    }


    if request.POST.get('event') == '1':
        event = models.Event.objects.filter(
            id=int(kwargs['entity_id'])).update(**dictionary)
    elif request.POST.get('event') == '2':
        event = account.List.objects.filter(
            id=int(kwargs['entity_id'])).update(**dictionary)
    else:
        entity = models.Entity.objects.filter(
            id=int(kwargs['entity_id'])).update(**dictionary)

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect('/')


def media_upload(request):
    if 'ie-fix' in request.POST:
        context = {
            'file_name': 'oh si'
        }
    else:
        folder = '/entity/'

        if 'event_picture' in request.POST:
            folder = '/event/'
        if 'event_cover_picture' in request.POST:
            folder = '/event/'
        if 'edit_profile' in request.POST:
            folder = '/profile/'
            id_user = request.user.id
            user = models.Profile.objects.get(user=id_user)
            user.picture = str(request.FILES['file'])
            user.save()

        if 'list_picture' in request.POST:
            folder = '/list/'
            id = request.POST.get('list_picture')
            if id != '':
                entity = account.List.objects.get(id=id)

                if request.POST.get('cover'):
                    entity.cover_picture = str(request.FILES['file'])
                else:
                    entity.picture = str(request.FILES['file'])
                entity.save()
        if 'entity' in request.POST:
            folder = '/entity/'
            id = request.POST.get('entity')
            if id != '':
                entity = models.Entity.objects.get(id=id)
                if request.POST.get('cover'):
                    entity.cover_picture = str(request.FILES['file'])
                else:
                    entity.picture = str(request.FILES['file'])

                entity.save()
        if 'event' in request.POST:
            folder = '/event/'
            id = request.POST.get('event')
            if id != '':
                entity = models.Event.objects.get(id=id)

                if 'event_cover_picture' in request.POST:
                    entity.cover_picture = str(request.FILES['file'])
                else:
                    entity.picture = str(request.FILES['file'])

                entity.save()

        if 'fb_img' in request.POST and request.POST.get('folder') == '/event/':
            folder = '/event/'
        elif request.POST.get('folder') == '/entity/':
            folder = '/entity/'

        print folder
        path_extension = str(request.user.id)+folder
        path = os.path.join(
            os.path.dirname(__file__), '..',
            'static/media/users/'+path_extension).replace('\\', '/')

        if 'fb_img' in request.POST:
            file = None
            file_name = request.POST.get('fb_img').split('/')
            file_name = file_name[-1]
            urllib.urlretrieve(request.POST.get('fb_img'), os.path.join(path, file_name))
        else:
            path += str(request.FILES['file'])
            file = request.FILES['file']
            file_name = str(request.FILES['file'])

        handle_uploaded_file(path, file)
        context = {
            'file_name': file_name
        }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def handle_uploaded_file(destination, f):
    if f is None:
        return
    with open(destination, 'wb+') as destination:
        for chunk in f.chunks():
                    destination.write(chunk)


def register_menu(request, **kwargs):
    template = kwargs['template_name']
    context = {}
    return render(request, template, context)


@login_required(login_url='/')
def register_event(request, **kwargs):
    template = kwargs['template_name']
    entity = models.Entity.objects.get(
        id=kwargs['entity_id'])
    entity_type = kwargs['entity_type']
    profile = models.Profile.objects.get(
        user__id=request.user.id)
    if entity_type == 'group':
        entity_type = ['grupos', 'group']
    elif entity_type == 'spot':
        entity_type = ['spots', 'spot']
    else:
        entity_type == 'organization'
        entity_type = ['organizaciones', 'organization']

    spots = models.Entity.objects.filter(type__name='spot')

    context = {
        'profile': profile,
        'entity': entity,
        'entity_type': entity_type,
        'spots': spots
    }

    return render(request, template, context)


def ajax_register_event(request):
    event = dict(request.POST)

    event['owner_id'] = int(request.user.id)
    profile = models.Profile.objects.filter(
        user__id=request.user.id)[0]
    if event['privacy_type'][0] == 'publica':
        event['privacy_type'] = 0
    else:
        event['privacy_type'] = 1

    if 'share_fb' in event:

        if event['share_fb'][0] == '0':
            event['share_fb'] = 0
        else:
            event['share_fb'] = 1

    del event['csrfmiddlewaretoken']
    copy = event
    for e, val in event.iteritems():
        if isinstance(val, list):
            if e == 'start_time':
                if val[0] == '':
                    copy[e] = datetime.datetime.now().isoformat()
                else:
                    d = datetime_from_str(val[0])
                    copy[e] = d[1].isoformat()
            elif e == 'end_time':
                if val[0] == '':
                    copy[e] = datetime.datetime.now().isoformat()
                else:
                    d = datetime_from_str(val[0])
                    copy[e] = d[1].isoformat()
            else:
                copy[e] = val[0]

    if event['place_spot'] != '':
        place_spot = int(event['place_spot'])
    else:
        place_spot = -1
    del event['place_spot']
    event = copy

    event = models.Event.objects.create(**event)
    event.save()
    if place_spot == 0:
        event.place_spot = 0
        event.save()
    else:
        spot = models.Entity.objects.filter(name=event.location_name,
                                            type__name='spot')
        if spot:
            event.lat = spot[0].lat
            event.long = spot[0].long
            event.save()
    if event is not None:
        success = event.id
        activity_data = {
            'user_id': request.user.id,
            'object': event.id,
            'added_to_object': event.location.id,
            'type': 'D',
            'added_to_type': 'E',
            'activity_id': 1
        }
        update_activity(activity_data)
    else:
        success = 'False'

    context = {
        'success': success
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def post_event_fb(event, user, profile):
    facebook_session = models.FacebookSession.objects.filter(
        uid=profile.fb_id)[0]
    fb_profile = facebook_session.query('me/events')
    pass


def event(request, **kwargs):
    template = kwargs['template_name']
    id_entity = int(kwargs['entity'])
    admins = models.MemberToObject.objects.filter(
        object=id_entity, object_type='E', is_admin=1)
    admins_list = list()
    for a in admins:
        admins_list.append(a.user_id)
    match = 0
    for ele in admins_list:
        if request.user.id == ele:
            match += 1
    if match == 0:
        return not_found(request)
    events = models.Event.objects.filter(location_id=id_entity)
    name = models.Entity.objects.get(id=id_entity)
    entity_type = models.Type.objects.get(
        entity__id=name.id)
    events_months = []

    for event in events:
        # Event date = Month, day, id
        event_date = []
        event_date.append(event.start_time.month)
        event_date.append(event.start_time.day)
        event_date.append(int(event.id))
        events_months.append(event_date)
    hc = calendar.HTMLCalendar(calendar.SUNDAY)
    nextHc = hc.formatyear((datetime.datetime.now().year+1), 12)
    hc = hc.formatyear(datetime.datetime.now().year, 12)
    year = ' '+str(datetime.datetime.now().year)
    nyear = ' '+str(datetime.datetime.now().year+1)
    hc = hc.replace('Sun', 'D')
    hc = hc.replace('Mon', 'L')
    hc = hc.replace('Tue', 'M')
    hc = hc.replace('Wed', 'M')
    hc = hc.replace('Thu', 'J')
    hc = hc.replace('Fri', 'V')
    hc = hc.replace('Sat', 'S')

    hc = hc.replace('dom', 'D')
    hc = hc.replace('lun', 'L')
    hc = hc.replace('mar', 'M')
    hc = hc.replace('mié', 'M')
    hc = hc.replace('jue', 'J')
    hc = hc.replace('vie', 'V')
    hc = hc.replace('sáb', 'S')

    nextHc = nextHc.replace('Sun', 'D')
    nextHc = nextHc.replace('Mon', 'L')
    nextHc = nextHc.replace('Tue', 'M')
    nextHc = nextHc.replace('Wed', 'M')
    nextHc = nextHc.replace('Thu', 'J')
    nextHc = nextHc.replace('Fri', 'V')
    nextHc = nextHc.replace('Sat', 'S')

    nextHc = nextHc.replace('dom', 'D')
    nextHc = nextHc.replace('lun', 'L')
    nextHc = nextHc.replace('mar', 'M')
    nextHc = nextHc.replace('mié', 'M')
    nextHc = nextHc.replace('jue', 'J')
    nextHc = nextHc.replace('vie', 'V')
    nextHc = nextHc.replace('sáb', 'S')

    hc = hc.replace('January', 'Enero' + year)
    hc = hc.replace('February', 'Febrero' + year)
    hc = hc.replace('March', 'Marzo' + year)
    hc = hc.replace('April', 'Abril' + year)
    hc = hc.replace('May', 'Mayo' + year)
    hc = hc.replace('June', 'Junio' + year)
    hc = hc.replace('July', 'Julio' + year)
    hc = hc.replace('August', 'Agosto' + year)
    hc = hc.replace('September', 'Septiembre'+ year)
    hc = hc.replace('October', 'Octubre' + year)
    hc = hc.replace('November', 'Noviembre' + year)
    hc = hc.replace('December', 'Diciembre' + year)

    hc = hc.replace('enero', 'Enero' + year)
    hc = hc.replace('febrero', 'Febrero' + year)
    hc = hc.replace('marzo', 'Marzo' + year)
    hc = hc.replace('Mzo', 'Marzo' + year)
    hc = hc.replace('abril', 'Abril' + year)
    hc = hc.replace('mayo', 'Mayo' + year)
    hc = hc.replace('junio', 'Junio' + year)
    hc = hc.replace('julio', 'Julio' + year)
    hc = hc.replace('agosto', 'Agosto' + year)
    hc = hc.replace('septiembre', 'Septiembre'+ year)
    hc = hc.replace('octubre', 'Octubre' + year)
    hc = hc.replace('noviembre', 'Noviembre' + year)
    hc = hc.replace('noVmbre', 'Noviembre' + year)
    hc = hc.replace('diciembre', 'Diciembre' + year)

    nextHc = nextHc.replace('January', 'Enero' + nyear)
    nextHc = nextHc.replace('February', 'Febrero' + nyear)
    nextHc = nextHc.replace('March', 'Marzo' + nyear)
    nextHc = nextHc.replace('April', 'Abril' + nyear)
    nextHc = nextHc.replace('May', 'Mayo' + nyear)
    nextHc = nextHc.replace('June', 'Junio' + nyear)
    nextHc = nextHc.replace('July', 'Julio' + nyear)
    nextHc = nextHc.replace('August', 'Agosto' + nyear)
    nextHc = nextHc.replace('September', 'Septiembre'+ nyear)
    nextHc = nextHc.replace('October', 'Octubre' + nyear)
    nextHc = nextHc.replace('November', 'Noviembre' + nyear)
    nextHc = nextHc.replace('December', 'Diciembre' + nyear)

    nextHc = nextHc.replace('enero', 'Enero' + nyear)
    nextHc = nextHc.replace('febrero', 'Febrero' + nyear)
    nextHc = nextHc.replace('marzo', 'Marzo' + nyear)
    nextHc = nextHc.replace('Mzo', 'Marzo' + nyear)
    nextHc = nextHc.replace('abril', 'Abril' + nyear)
    nextHc = nextHc.replace('mayo', 'Mayo' + nyear)
    nextHc = nextHc.replace('junio', 'Junio' + nyear)
    nextHc = nextHc.replace('julio', 'Julio' + nyear)
    nextHc = nextHc.replace('agosto', 'Agosto' + nyear)
    nextHc = nextHc.replace('septiembre', 'Septiembre'+ nyear)
    nextHc = nextHc.replace('octubre', 'Octubre' + nyear)
    nextHc = nextHc.replace('noviembre', 'Noviembre' + nyear)
    nextHc = nextHc.replace('noVmbre', 'Noviembre' + nyear)
    nextHc = nextHc.replace('diciembre', 'Diciembre' + nyear)

    html_parser = HTMLParser.HTMLParser()
    unescaped = html_parser.unescape(hc)
    unescaped += html_parser.unescape(nextHc)

    if entity_type.name == 'group':
        entity_type = ['grupos', 'group']
    elif entity_type.name == 'spot':
        entity_type = ['spots', 'spot']
    else:
        entity_type.name == 'organization'
        entity_type = ['organizaciones', 'organization']

    context = {
        'entity_type': entity_type,
        'entity': name,
        'calendar': unescaped,
        'id_entity': id_entity
    }

    return render(request, template, context)


def get_events(request, **kwargs):
    entity = kwargs['entity'].split('_', 1)
    entity = entity[1]
    if int(entity) > 0 or int(request.POST.get('curr_month')) == -1:
        if int(entity) != -1:
            events_ = models.Event.objects.filter(
                location_id=int(entity))
        else:
            events_ = models.Event.objects.all()

        events = []
        for event in events_:
            # Event date = Month, day, id
            event_date = list()
            event_date.append(event.start_time.month)
            event_date.append(event.start_time.day)
            event_date.append(int(event.id))
            events.append(event_date)

        events_ = models.Event.objects.filter(location=entity)
        events = []
        for event in events_:
            # Event date = Month, day, id
            event_data = list()
            event_data.append(event.name)
            event_data.append(event.start_time.day)
            event_data.append(event.start_time.isoweekday())
            event_data.append(event.picture)
            event_data.append(event.description)
            event_data.append(
                str(event.start_time.hour)+':'+str(event.start_time.minute))
            event_data.append(event.id)
            event_data.append(event.location_name)
            event_data.append(event.owner_id)
            event_data.append(event.share_fb)
            events.append(event_data)
    context = {
        'events': list(events)
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def edit_event(request, **kwargs):
    template = kwargs['template_name']
    obj = kwargs['entity']
    obj = models.Event.objects.get(
        pk=int(obj))
    admins_list = list()
    admins = models.MemberToObject.objects.filter(
        object=obj.location_id, object_type='E', is_admin=True)
    for a in admins:
        admins_list.append(a.user_id)
    match = 0
    for ele in admins_list:
        if request.user.id == ele:
            match += 1
    if match == 0:
        return not_found(request)
    entity_type = models.Type.objects.get(
        entity__id=obj.location_id)
    if entity_type.name == 'group':
        entity_type = ['del grupo', 'group']
    elif entity_type.name == 'organization':
        entity_type = ['de la organizacion', 'organization']
    elif entity_type.name == 'spot':
        entity_type = ['del spot', 'spot']
    spots = models.Entity.objects.filter(type__name='spot')
    context = {
        'entity': obj,
        'entity_type': entity_type,
        'spots': spots
    }
    return render(request, template, context)


def admin_users(request, **kwargs):
    template = kwargs['template_name']
    obj = int(kwargs['entity'])
    obj = models.Entity.objects.get(
        pk=obj)
    entity_type = models.Type.objects.get(
        entity__id=obj.id)
    members = models.MemberToObject.objects.filter(
        object=obj.id, object_type='E')
    admins = members.filter(is_admin=True)
    requests = members.filter(request=True)
    users = list()
    for member in members:
        users.append(member.user_id)

    if entity_type.name == 'group':
        entity_type = ['Crear un nuevo grupo', 'group', 'grupo']
    elif entity_type.name == 'organization':
        entity_type = ['Crear una nueva organizacion', 'organization', 'organizacion']
    elif entity_type.name == 'spot':
        entity_type = ['Crear un nuevo spot', 'spot', 'spot']

    context = {
        'members': admins,
        'entity_type': entity_type,
        'entity': obj,
        'requests': requests

    }
    return render(request, template, context)


def remove_add_user(request, **kwargs):
    
    if 'user_email' in request.POST:
        members = models.MemberToObject.objects.filter(
            object=int(request.POST.get('entity')),
            object_type='E', is_admin=1)
        admins = list()
        admins.append(request.user.id)
        for member in members:
            if request.user.id != member.user_id:
                admins.append(member.user_id)
        if request.POST.get('user_email') == '-1':
            members = models.MemberToObject.objects.filter(
                object=int(request.POST.get('entity')), object_type='E').filter(is_admin=True)
            users = list()
            for member in members:
                users.append(member.user_id)
            objs = models.User.objects.filter(
                id__in=users)
        elif request.POST.get('user_email') == '-2':
            members = models.MemberToObject.objects.filter(
                object=int(request.POST.get('entity')), object_type='E').filter(request=True)
            users = list()
            for member in members:
                users.append(member.user_id)
            objs = models.User.objects.filter(
                id__in=users)
        elif request.POST.get('user_email') == '-3':
            members = models.MemberToObject.objects.filter(
                object=int(request.POST.get('entity')), object_type='E').filter(is_member=True)
            users = list()
            for member in members:
                users.append(member.user_id)
            objs = models.User.objects.filter(
                id__in=users)
        # Get members of group
        elif request.POST.get('user_email') == '-4':

            members = models.MemberToObject.objects.filter(
                object=int(request.POST.get('entity')), object_type='E').filter(is_member=True).exclude(
                user_id__in=admins)
            users = list()
            for member in members:
                if request.user.id != member.user_id:
                    users.append(member.user_id)
            objs = models.User.objects.filter(
                id__in=users)
        else:
            members = models.MemberToObject.objects.filter(
                object=int(request.POST.get('entity')), object_type='E').filter(is_member=True)
            members_list = list()
            for member in members:
                if request.user.id != member.user_id:
                    members_list.append(member.user_id)
            objs = models.User.objects.filter(
                email__icontains=request.POST.get('user_email'), id__in=members_list).exclude(id__in=admins)

        users = list()
        for obj in objs:
            obj_data = list()
            profile = models.Profile.objects.filter(
                user_id=obj.id)
            member = models.MemberToObject.objects.filter(
                user_id=obj.id, object=int(request.POST.get('entity')))
            bio = ''
            for data in profile:
                obj_data.append(data.picture)
                bio = data.biography
            obj_data.append(obj.id)
            obj_data.append(obj.username)
            obj_data.append(datetime.datetime.now().month - obj.date_joined.month)
            super_user = 0
            if member:
                super_user = member[0].super_user
            obj_data.append(super_user)
            obj_data.append(bio)

            users.append(obj_data)

        context = {
            'users': users
        }
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')
    else:
        obj = kwargs['user_id']
        obj = models.MemberToObject.objects.get_or_create(
            user_id=int(obj), object_type='E',
            object=int(request.POST.get('entity')))[0]

        if int(request.POST.get('remove')) == 1:
            obj.is_admin = 0
            obj.request = 0
        elif int(request.POST.get('remove')) == 2:
            obj.is_member = 0
            obj.is_admin = 0
            obj.request = 0
        else:
            if obj.request:
                obj.is_member = True
                obj.request = 0
            else:
                obj.is_admin = True
                obj.is_member = True
                obj.request = 0

        if int(request.POST.get('remove')) == 3:
            obj.is_member = 0
            obj.is_admin = False

        obj.save()
    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def datetime_from_str(time_str):
    """Return (<scope>, <datetime.datetime() instance>) for the given
    datetime string.

    >>> _datetime_from_str("2009")
    ('year', datetime.datetime(2009, 1, 1, 0, 0))
    >>> _datetime_from_str("2009-12")
    ('month', datetime.datetime(2009, 12, 1, 0, 0))
    >>> _datetime_from_str("2009-12-25")
    ('day', datetime.datetime(2009, 12, 25, 0, 0))
    >>> _datetime_from_str("2009-12-25 13")
    ('hour', datetime.datetime(2009, 12, 25, 13, 0))
    >>> _datetime_from_str("2009-12-25 13:05")
    ('minute', datetime.datetime(2009, 12, 25, 13, 5))
    >>> _datetime_from_str("2009-12-25 13:05:14")
    ('second', datetime.datetime(2009, 12, 25, 13, 5, 14))
    >>> _datetime_from_str("2009-12-25 13:05:14.453728")
    ('microsecond', datetime.datetime(2009, 12, 25, 13, 5, 14, 453728))
    """
    import time
    import datetime
    formats = [
        # <scope>, <pattern>, <format>
        ("year", "YYYY", "%Y"),
        ("month", "YYYY-MM", "%Y-%m"),
        ("day", "YYYY-MM-DD", "%Y-%m-%d"),
        ("hour", "YYYY-MM-DD HH", "%Y-%m-%d %H"),
        ("minute", "YYYY-MM-DD HH:MM", "%Y-%m-%d %H:%M"),
        ("second", "YYYY-MM-DD HH:MM:SS", "%Y-%m-%d %H:%M:%S"),
        # ".<microsecond>" at end is manually handled below
        ("microsecond", "YYYY-MM-DD HH:MM:SS", "%Y-%m-%d %H:%M:%S"),
    ]
    for scope, pattern, format in formats:
        if scope == "microsecond":
            # Special handling for microsecond part. AFAIK there isn't a
            # strftime code for this.
            if time_str.count('.') != 1:
                continue
            time_str, microseconds_str = time_str.split('.')
            try:
                microsecond = int((microseconds_str + '000000')[:6])
            except ValueError:
                continue
        try:
            # This comment here is the modern way. The subsequent two
            # lines are for Python 2.4 support.
            #t = datetime.datetime.strptime(time_str, format)
            t_tuple = time.strptime(time_str, format)
            t = datetime.datetime(*t_tuple[:6]).replace(tzinfo=utc)
        except ValueError:
            pass
        else:
            if scope == "microsecond":
                t = t.replace(microsecond=microsecond)
            return scope, t
    else:
        raise ValueError("could not determine date from %r: does not "
            "match any of the accepted patterns ('%s')"
            % (time_str, "', '".join(s for s,p,f in formats)))


def registry_list(request, **kwargs):
    template = kwargs['template_name']
    context = {}
    return render(request, template, context)


def register_ajax_list(request):
    list = dict(request.POST)
    type = list['type_list'][0]
    del list['type_list']
    del list['csrfmiddlewaretoken']
    del list['type']

    copy = list
    for e, val in list.iteritems():
            copy[e] = val[0]

    list = copy
    user = request.user
    list['user'] = user
    list['date'] = datetime.datetime.today()
    list['status'] = True
    list['type'] = type
    list['default_type'] = -1

    list = account.List.objects.create(**list)
    list.save()

    if list is not None:
        succuess = 'True'
    else:
        succuess = 'False'
    context = {
        'success': succuess
    }

    if succuess == 'True':
        context['id_list'] = list.id

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def add_genre(request):
    user = request.user
    id_genre = request.POST.get('id_genre')
    genre = account.Genre.objects.get(id=int(id_genre))
    genre_status = account.ListGenre.objects.filter(genre=genre,list__type='G',
                                                    list__user=user)
    if len(genre_status) == 0:
        list = account.List.objects.get(user=user, type='G')
        dictionary = {
            'genre': genre,
            'list': list
        }
        genre_user = account.ListGenre.objects.create(**dictionary)
        genre_user.save()
    else:
        genre_user = account.ListGenre.objects.get(genre=genre, list__user=user)

        if genre_user.status:
            genre_user.status = False
        else:
            genre_user.status = True
        genre_user.save()

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def delete_title(request):
    id_title = request.POST.get('id_title')
    id_list = request.POST.get('id_list')
    type_list = request.POST.get('type_list')
    if type_list == 'T':
        title_favorite = account.ListTitle.objects.get(id=id_list)
        title_favorite.delete()
    else:
        title_favorite = account.ListAuthor.objects.get(
            author__id=id_title, list__id=id_list)
        title_favorite.delete()

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def delete_list(request):

    id_list = request.POST.get('id_list')
    list = account.List.objects.get(id=id_list)
    list.status = False
    list.save()

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def delete_page(request):

    id_page = request.POST.get('id_list')
    page = account.Page.objects.get(id=id_page)
    page.status = False
    page.save()

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def delete_picture(request):
    type = request.POST.get('type')
    success = 'False'
    if type == 'profile':
        id_user = int(request.POST.get('id'))
        profile = models.Profile.objects.get(user__id=id_user)

        if profile:
            success = 'True'
            profile.picture = ''
            profile.save()

    elif type == 'entity':
        id_entity = int(request.POST.get('id'))
        entity = models.Entity.objects.get(id=id_entity)

        if entity:
            success = 'True'
            if int(request.POST.get('cover')) == 1:
                entity.cover_picture = ''
            else:
                entity.picture = ''

            entity.save()
    elif type == 'event':
        id_entity = int(request.POST.get('id'))
        entity = models.Event.objects.get(id=id_entity)

        if entity:
            success = 'True'
            if int(request.POST.get('cover')) == 1:
                entity.cover_picture = ''
            else:
                entity.picture = ''

            entity.save()
    elif type == 'list':
        id_entity = int(request.POST.get('id'))
        entity = account.List.objects.get(id=id_entity)

        if entity:
            success = 'True'
            if int(request.POST.get('cover')) == 1:
                entity.cover_picture = ''
            else:
                entity.picture = ''

            entity.save()

    context = {
            'succes': success
        }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def add_rate(request):

    user = request.user
    type = request.POST.get('type')
    grade = request.POST.get('grade')
    element_id = request.POST.get('element_id')

    list = {
        'type': str(type),
        'grade': int(grade),
        'user': user,
        'element_id': int(element_id)
    }

    rate = account.Rate.objects.filter(user=user, type=str(type),
                                       element_id=int(element_id))

    if rate:
        rate[0].grade = int(grade)
        rate[0].save()

    else:
        rate_user = account.Rate.objects.create(**list)
        rate_user.save()
        activity_data = {
            'user_id': request.user.id,
            'object': int(element_id),
            'added_to_object': request.user.id,
            'type': str(type),
            'added_to_type': 'U',
            'activity_id': 6
        }
        update_activity(activity_data)

    count_rate = account.Rate.objects.filter(element_id=element_id,
                                             type=str(type))
    my_count = account.Rate.objects.get(user=user, element_id=element_id,
                                        type=str(type))

    count = 0
    for obj in count_rate:
        count = count + obj.grade

    count_grade = Decimal(count)/(len(count_rate))

    context = {
        'element_id': my_count.element_id,
        'count': len(count_rate),
        'count_grade': str(count_grade),
        'my_count_grade': my_count.grade,
        'type': my_count.type
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def create_default_list(user):
    dict_list = {
                'name': 'Mis libros leidos',
                'type': 'T',
                'default_type': 1,
                'status': True,
                'description': 'texto',
                'privacy': False,
                'user': user,
                'picture': ''
            }

    list1 = account.List.objects.create(**dict_list)
    list1.save()
    dict_list['name'] = 'Mis libros por leer'
    dict_list['default_type'] = 2
    list2 = account.List.objects.create(**dict_list)
    list2.save()
    dict_list['name'] = 'Mis libros favoritos'
    dict_list['default_type'] = 0
    list3 = account.List.objects.create(**dict_list)
    list3.save()
    dict_list['type'] = 'G'
    dict_list['name'] = 'Mis generos'
    dict_list['default_type'] = 3
    list4 = account.List.objects.create(**dict_list)
    list4.save()
    dict_list['type'] = 'T'
    dict_list['name'] = 'Estoy leyendo'
    dict_list['default_type'] = 5
    list4 = account.List.objects.create(**dict_list)
    list4.save()


def not_found(request):
    return HttpResponseRedirect('/qro_lee/')


def add_my_title(request):

    user = request.user
    list_id_titles = []
    list_id_authors = []

    if request.POST.get('list') != None:
        list = ast.literal_eval(request.POST.get('list'))
        if request.POST.get('type_list') == 'T':

            for obj in list:

                if obj['it']['id'] == -1:

                    date = str(obj['it']['attribute']['publishedDate']).split("-")
                    date_time = str(obj['it']['attribute']['publishedDate'])

                    if len(date) < 3 :
                        date_time = str(date[0]) + '-01-01'
                    desc = str(obj['it']['attribute']['description'])

                    li ={
                        'title':str(obj['it']['attribute']['title']),
                        'subtitle':'',
                        'edition':'',
                        'published_date':date_time,
                        'cover':str(obj['it']['attribute']['cover']),
                        'publisher':str(obj['it']['attribute']['publisher']),
                        'language':str(obj['it']['attribute']['language']),
                        'country':str(obj['it']['attribute']['country']),
                        'type':'T',
                        'isbn':str(obj['it']['attribute']['isbn']),
                        'isbn13':str(obj['it']['attribute']['isbn13']),
                        'pages':int(obj['it']['attribute']['pages']),
                        'picture':str(obj['it']['attribute']['picture']),
                        'description':desc[0:800],
                        'id_google':obj['it']['attribute']['id_google']
                    }

                    title_exist = account.Title.objects.filter(db_model.Q(id_google= li['id_google']) |
                                                    db_model.Q(title = li['title']))

                    if not title_exist:
                        title = account.Title.objects.create(**li)
                        title.save()
                    else:
                        title = title_exist[0]

                    name = obj['it']['attribute']['author'][0]
                    author = create_author(name, title)

                else:
                    title = account.Title.objects.get(id=obj['it']['id'])

                if int(request.POST.get('edit_list')) != 0:
                    list = account.List.objects.get(id=request.POST.get('edit_list'))
                    add_list = account.ListTitle.objects.create(list=list, title=title)
                    add_list.save()

                list_id_titles.append(int(title.id))
                type_li = int(request.POST.get('type'))

                if type_li == 1 or type_li == 3 or type_li == 5:
                    for type in obj['it']['default_type']:
                        lista = account.List.objects.get(user=user, default_type=type)

                        list_ti = {
                            'list': lista,
                            'title': title
                        }

                        my_list = account.ListTitle.objects.filter(list=lista, title=title)

                        if len(my_list) == 0:
                            my_list = account.ListTitle.objects.create(**list_ti)
                            my_list.save()
                            activity = account.Activity.objects.filter(object=my_list.title.id,
                                                                       added_to_object=my_list.list.id)
                            activity_id = 1

                            if obj['it']['default_type'][0] == 5:
                                activity_id = 9
                            if not activity:
                                activity_data = {
                                    'user_id': request.user.id,
                                    'object': title.id,
                                    'added_to_object': my_list.list.id,
                                    'type': 'T',
                                    'added_to_type': 'L',
                                    'activity_id': activity_id
                                }
                                update_activity(activity_data)
                            else:
                                activity[0].date = datetime.datetime.today()
                                activity[0].save()

        if request.POST.get('type_list') == 'A':
            for obj in list:

                if obj['it']['id'] == -1:
                    desc = str(obj['it']['attribute']['biography'])

                    li ={
                        'name': str(obj['it']['attribute']['name']),
                        'picture': str(obj['it']['attribute']['picture']) + '?maxwidth=250&maxheight=250&mode=fillcropmid',
                        'biography': desc[0:500],
                        'birthday': datetime.datetime.today(),
                        'id_api': str(obj['it']['attribute']['id_api'])
                    }

                    author_exist = account.Author.objects.filter(db_model.Q(id_api=li['id_api']) |
                                                                 db_model.Q(name=li['name']))
                    if not author_exist:
                        author = account.Author.objects.create(**li)
                        author.save()
                    else:
                        author = author_exist[0]

                else:
                    author = account.Author.objects.get(id=obj['it']['id'])

                if int(request.POST.get('edit_list')) != 0:
                    list = account.List.objects.get(id=request.POST.get('edit_list'))
                    add_list = account.ListAuthor.objects.create(list=list, author=author)
                    add_list.save()

                list_id_authors.append(int(author.id))

    fields_related_objects = account.Title._meta.get_all_related_objects(
    local_only=True)
    fields = account.Title._meta.get_all_field_names()

    fields_foreign = []
    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]
    list_dict = {}

    array_date = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    for i in range(3):
        list_titles = account.ListTitle.objects.filter(list__default_type=i,
                                        list__user=user, list__status=True)
        my_list = {}
        for obj in list_titles:
            fields_title = {}
            for field in fields:
                if isinstance(obj.title.__getattribute__(str(field)), unicode):
                    fields_title[str(field)] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    fields_title[str(field)] = str(obj.title.__getattribute__(str(field)))
            title_author = account.AuthorTitle.objects.filter(title=obj.title)
            name_author = ''
            id_author = ''

            if len(title_author) != 0:
                name_author = title_author[0].author.name
                id_author = title_author[0].author.id

            rate = account.Rate.objects.all().values('element_id').\
                annotate(count = db_model.Count('element_id'),
                         score = db_model.Avg('grade'))

            fields_title['grade'] = 0
            fields_title['user'] = 0

            for obj_rate in rate:
                if obj_rate['element_id'] == obj.title.id:

                    fields_title['grade'] = obj_rate['score']
                    my_grade = account.Rate.objects.filter(element_id=obj_rate['element_id'],
                                                           user=user)
                    if len(my_grade) != 0:
                        fields_title['user'] = int(my_grade[0].user.id)

            activity = account.Activity.objects.filter(object=obj.title.id,
                                                    added_to_object=obj.list.id)

            fields_title['author'] = name_author
            fields_title['id_author'] = id_author
            fields_title['id_list'] = obj.id
            act_date = ''
            if len(activity) != 0:
                act_date = str(activity[0].date.day) + ' de ' \
                               + str(array_date[(activity[0].date.month-1)]) + ' ' \
                              + str(activity[0].date.year)
            fields_title['date'] = act_date
            my_list[int(obj.id)] = fields_title

        type = ''
        if(i == 0):
            type = 'book_favorite'
        if(i == 1):
            type = 'book_read'
        if(i == 2):
            type = 'book_for_reading'

        list_dict[type] = my_list

    context = simplejson.dumps(list_dict)
    if int(request.POST.get('type')) == 4 and request.POST.get('type_list') == 'T':
        context = simplejson.dumps(list_id_titles)

    if int(request.POST.get('type')) == 4 and  request.POST.get('type_list') == 'A':
        context = simplejson.dumps(list_id_authors)

    if int(request.POST.get('type')) == 5:
        list = account.ListTitle.objects.get(list__default_type=5,list__user=user,
                                              title__id=list_id_titles[0])
        context = {
            'name':list.title.title,
            'id_list':list.id
        }

        context = simplejson.dumps(context)

    return HttpResponse(context, mimetype='application/json')


def add_titles_author_list(request):

    user = request.user
    id_list = request.POST.get('id_list')
    type = request.POST.get('type')
    list = ast.literal_eval(request.POST.get('list'))
    my_list = account.List.objects.get(id=id_list, user=user)
    name = my_list.name.replace(' ', '')

    if type == 'T':

        for obj in list:

            title = account.Title.objects.get(id=int(obj))

            list_title = {
                'title': title,
                'list': my_list
            }
            rel_list = account.ListTitle.objects.create(**list_title)
            rel_list.save()

    else:

        for obj in list:

            author = account.Author.objects.get(id=int(obj))
            list_title = {
                'author': author,
                'list': my_list
            }
            rel_list = account.ListAuthor.objects.create(**list_title)
            rel_list.save()

    activity_data = {
        'user_id': request.user.id,
        'object': id_list,
        'added_to_object': request.user.id,
        'type': 'L',
        'added_to_type': 'U',
        'activity_id': 1
    }
    update_activity(activity_data)

    return HttpResponseRedirect('/qro_lee/profile/list/'+ id_list + '/')


@login_required(login_url='/')
def edit_list(request, **kwargs):

    id_list = kwargs['id_list']
    list = account.List.objects.get(id=id_list)
    if list.user_id != request.user.id:
        return HttpResponseRedirect('/qro_lee')
    type = list.type
    dict_items = {}

    if type == 'T':
        list_t_a = account.ListTitle.objects.filter(list=list)
        fields_related_objects = account.Title._meta.get_all_related_objects(
            local_only=True)
        fields = account.Title._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        for obj in list_t_a:
            items = {}
            for field in fields:
                if isinstance(obj.title.__getattribute__(str(field)), unicode):
                    items[field] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    items[field] = obj.title.__getattribute__(str(field))

            grade_title = 0
            rate_title = account.Rate.objects.filter(element_id=obj.title.id).\
                values('element_id').\
            annotate(count = db_model.Count('element_id'),
                     score = db_model.Avg('grade'))

            if len(rate_title) != 0:
                grade_title = rate_title[0]['score']

            author_name = 'autor anonimo'

            author =  account.AuthorTitle.objects.filter(title=obj.title)

            if len(author) != 0:
                author_name = author[0].author.name

            #--------------date------------------------#
            items['default_type'] = obj.list.default_type
            items['id_list'] = obj.id
            items['author'] = author_name
            items['grade'] = grade_title
            dict_items[int(obj.title.id)] = items


    else:
        list_t_a = account.ListAuthor.objects.filter(list=list)
        fields_related_objects = account.Author._meta.get_all_related_objects(
            local_only=True)
        fields = account.Author._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        for obj in list_t_a:
            items = {}
            for field in fields:
                if isinstance(obj.author.__getattribute__(str(field)), unicode):
                    items[field] = obj.author.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    items[field] = obj.author.__getattribute__(str(field))

            count_titles = account.AuthorTitle.objects.filter(author=obj.author).values('author').\
            annotate(count = db_model.Count('title'))

            count = 0
            if len(count_titles) != 0:
                count = count_titles[0]['count']

            items['count'] = count
            items['default_type'] = obj.list.default_type
            items['id_list'] = obj.list.id
            dict_items[int(obj.author.id)] = items

    rate = account.Rate.objects.filter(element_id=list.id).values('element_id').\
            annotate(count = db_model.Count('element_id'),
                     score = db_model.Avg('grade'))

    grade = 0
    if len(rate) != 0:
        grade = rate[0]['score']

    template = kwargs['template_name']

    context = {
        'user': request.user,
        'list':list,
        'list_t_a':dict_items,
        'grade':grade
    }

    return render(request, template, context)


def update_list(request, **kwargs):
    field = request.POST.get('field')
    value = request.POST.get('value')

    dictionary = {
        field: value
    }

    entity = account.List.objects.filter(id=kwargs['list_id']).\
        update(**dictionary)

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def edit_title_read(request):

    id_list = int(request.POST.get('id_list'))
    date = request.POST.get('date')
    context = {}
    array_date = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

    if int(request.POST.get('type')) == 1:
        list_title = account.ListTitle.objects.get(id=id_list)

        if date == '':
            act_date = datetime.datetime.now().isoformat()
        else:
            d = datetime_from_str(date)
            act_date = d[1].isoformat()

        activity = account.Activity.objects.filter(object=list_title.title.id,
                                                added_to_object=list_title.list.id)
        if len(activity)!=0:
            activity[0].date = act_date
            activity[0].save()

        context['succes'] = 'True'
        context['type'] = 2
        context['date'] = date

    if int(request.POST.get('type')) == 2:
        list_title = account.ListTitle.objects.get(id=id_list)
        lis = account.List.objects.get(user=list_title.list.user, default_type=1)

        if date == '':
            act_date = datetime.datetime.now().isoformat()
        else:
            d = datetime_from_str(date)
            act_date = d[1].isoformat()

        activity = account.Activity.objects.filter(object=list_title.title.id,
                                                added_to_object=list_title.list.id)
        list_title.list = lis
        list_title.save()

        if len(activity)!=0:
            activity[0].date = act_date
            activity[0].added_to_object = list_title.list.id
            activity[0].save()
        else:
            activity_data = {
                'user_id': request.user.id,
                'object': list_title.title.id,
                'added_to_object': list_title.list.id,
                'type': 'T',
                'added_to_type': 'L',
                'activity_id': 9
            }
            update_activity(activity_data)

        dict_list = {}

        list_read = account.ListTitle.objects.filter(list__default_type=1,
                                                     list__user=request.user)

        fields_related_objects = account.Title._meta.get_all_related_objects(
            local_only=True)
        fields = account.Title._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        dict_items = {}
        for obj in list_read:
            items = {}
            for field in fields:
                if isinstance(obj.title.__getattribute__(str(field)), unicode):
                    items[field] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    if field == 'published_date':
                        items[field] = str(obj.title.__getattribute__(str(field)))
                    else:
                        items[field] = obj.title.__getattribute__(str(field))

                grade_title = 0
                rate_title = account.Rate.objects.filter(element_id=obj.title.id).\
                    values('element_id').\
                annotate(
                    count=db_model.Count('element_id'), score=db_model.Avg('grade'))

                if len(rate_title) != 0:
                    grade_title = rate_title[0]['score']

                author_name = 'autor anonimo'

                author =  account.AuthorTitle.objects.filter(title=obj.title)
                activity = account.Activity.objects.filter(object=obj.title.id,
                                                       added_to_object=obj.list.id)
                id_author = 0
                if len(author) != 0:
                    author_name = author[0].author.name
                    id_author = author[0].author.id

                #--------------date------------------------#
                items['default_type'] = obj.list.default_type
                items['id_list'] = obj.id
                items['id_author'] = id_author
                if len(activity) != 0:
                    items['date'] = str(activity[0].date.day) + ' de ' \
                                + str(array_date[(activity[0].date.month-1)]) + ' ' \
                                + str(activity[0].date.year)
                items['author'] = author_name
                items['grade'] = grade_title
                items['id_user'] = obj.list.user.id
                dict_items[int(obj.title.id)] = items

            dict_list[int(obj.list.default_type)] = dict_items

        context['succes'] = 'True'
        context['type'] = 1
        context['date'] = date
        context['list_read'] = dict_list

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def update_activity(data):
    """
    User = user that creates the move
    Object is the object on which the activity was made
    Type = E (entity) T (title) L (list) etc...
    Verb = action Actualizo Creo etc...
    """
    if data['activity_id'] == 10:
        activity = account.Activity.objects.filter(
            user_id=data['user_id'], object=data['object'],
            added_to_object=data['added_to_object'], added_to_type=data['added_to_type'],
            activity_id=5, type=data['type'])
        if activity:
            activity = activity[0]
            activity.activity_id = 10
            activity.save()
    else:
        activity = account.Activity.objects.filter(
            user_id=data['user_id'], object=data['object'],
            added_to_object=data['added_to_object'], added_to_type=data['added_to_type'],
            activity_id=10, type=data['type'])
        if activity:
            activity[0].activity_id = 5
            activity[0].save()
            return
        else:
            activity = account.Activity.objects.filter(
                user_id=data['user_id'], object=data['object'],
                added_to_object=data['added_to_object'], added_to_type=data['added_to_type'],
                activity_id=5, type=data['type'])
            if not activity:
                activity = account.Activity.objects.create(**data)
                activity.save()


def cheking_book(request):
    list =  ast.literal_eval(request.POST.get('query'))
    code_book = list['code_book']
    del list['code_book']
    book = models.Book.objects.get(code=code_book)
    list['book'] = book
    user = 0
    cheking = False

    if 'name_ext' in list:

        exist_user = models.ExternalUser.objects.filter(email=list['email_ext'])

        if exist_user:
            user_cheking = models.Travel.objects.filter(user = exist_user[0].id).latest('status')
            if user_cheking:
                if user_cheking.status:
                    cheking = True

        if not exist_user:
            user_ext = models.ExternalUser.objects.create(
                name = list['name_ext'],
                email = list['email_ext']
            )
            user_ext.save()
        else:
            user_ext = exist_user[0]

        del list['name_ext']
        del list['email_ext']
        list['type_user'] = 0
        user = user_ext.id

    else:
        list['type_user'] = 1
        user = request.user.id

    list['user'] = user

    if not cheking:
        travel = models.Travel.objects.create(**list)
        travel.save()
    else:
        travel = ''

    succes = 'False'
    code = 0
    if travel:
        succes = 'True'

    context = {
        'succes': succes,
        'code_book': code_book

    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def registry_book(request, **kwargs):
    if request.POST.get('api_type') == 'google_api':
        isbn = request.POST.get('isbn')
        url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:'+isbn
        response = urllib2.urlopen(url)
        response = simplejson.load(response)
        attribute = response['items'][0]['volumeInfo']
        genres = account.Genre.objects.all()

        author = 'anonimo'
        picture = ''
        publishedDate = datetime.datetime.today()
        pages = 100
        publisher = ''

        if attribute['authors']:
            author = attribute['authors'][0]
        if 'imageLinks' in attribute:
            if attribute['imageLinks']['thumbnail']:
                picture = attribute['imageLinks']['thumbnail']
        if 'publisher' in attribute:
            publisher = attribute['publisher']
        title = attribute['title']
    else:
        isbn = request.POST.get('isbn')
        url = 'https://www.goodreads.com/book/isbn?format=xml&isbn='+isbn.replace('"', '')+'&key='+settings.GOODREADS_KEY
        response = urllib2.urlopen(url).read()
        dom = minidom.parseString(response)
        title = dom.getElementsByTagName('title')[0].toxml()
        title = title.replace('<title>', '').replace('</title>', '').replace('<![CDATA[','').replace(']]>','')
        author = dom.getElementsByTagName('name')[0].toxml()
        author = author.replace('<name>', '').replace('</name>', '')
        publisher = dom.getElementsByTagName('publisher')[0].toxml()
        publisher = publisher.replace('<publisher>', '').replace('<publisher/>', '')
        picture = dom.getElementsByTagName('image_url')[0].toxml()
        picture = picture.replace('<image_url>', '').replace('</image_url>', '')
        genres = account.Genre.objects.all()

    book = {
        'title': title,
        'author': author,
        'isbn': isbn,
        'publisher': publisher,
        'picture': picture
    }

    template = kwargs['template_name']
    context = {
        'book': book,
        'genres': genres,
        'api_type': request.POST.get('api_type')
    }

    return render(request, template, context)


def register_ajax_book(request):
    #9786071111104
    list = ast.literal_eval(request.POST.get('query'))
    list['user'] = request.user
    isbn = list['isbn']
    author = 'anonimo'

    if request.POST.get('api_type') == 'google_api':
        url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:'+isbn
        response = urllib2.urlopen(url)
        response = simplejson.load(response)
        attribute = response['items'][0]['volumeInfo']
        dict = {
            'name': list['genre'],
        }

        picture = ''
        publishedDate = datetime.datetime.today()
        pages = 100
        publisher = ''

        if 'authors' in attribute:
            author = attribute['authors'][0]
        if 'imageLinks' in attribute:
            if attribute['imageLinks']['thumbnail']:
                picture = attribute['imageLinks']['thumbnail']
        if 'publisher' in attribute:
            publisher = attribute['publisher']

        date = str(attribute['publishedDate']).split("-")
        publishedDate = str(attribute['publishedDate'])

        if len(date) < 3:
            publishedDate = str(date[0]) + '-01-01'
        isbn13 = attribute['industryIdentifiers'][1]['identifier']
        country = response['items'][0]['accessInfo']['country']
        title = attribute['title']
        language = attribute['language']
    else:
        url = 'https://www.goodreads.com/book/isbn?format=xml&isbn='+isbn.replace('"', '')+'&key='+settings.GOODREADS_KEY
        response = urllib2.urlopen(url).read()
        dom = minidom.parseString(response)
        title = dom.getElementsByTagName('title')[0].toxml()
        title = title.replace('<title>', '').replace('</title>', '')
        author = dom.getElementsByTagName('name')[0].toxml()
        author = author.replace('<name>', '').replace('</name>', '')
        publisher = dom.getElementsByTagName('publisher')[0].toxml()
        publisher = publisher.replace('<publisher>', '').replace('</publisher>', '')
        picture = dom.getElementsByTagName('image_url')[0].toxml()
        picture = picture.replace('<image_url>', '').replace('</image_url>', '')
        pages = dom.getElementsByTagName('num_pages')[0].toxml()
        pages = pages.replace('<num_pages>', '').replace('</num_pages>', '')
        pages = pages.replace('<![CDATA[', '')
        pages = int(pages.replace(']]>', ''))
        isbn13 = dom.getElementsByTagName('isbn13')[0].toxml()
        isbn13 = isbn13.replace('<isbn13>', '').replace('</isbn13>', '')
        isbn13 = isbn13.replace('<![CDATA[', '')
        isbn13 = isbn13.replace(']]>', '')
        country = ''
        language = dom.getElementsByTagName('language_code')[0].toxml()
        language = language.replace('<language_code>', '').replace('</language_code>', '')
        year = dom.getElementsByTagName('publication_year')[0].toxml()
        year = year.replace('<publication_year>', '').replace('</publication_year>', '')
        month = dom.getElementsByTagName('publication_month')[0].toxml()
        if month[-2:] == '/>':
            month = month.replace('<publication_month/>', '')
        else:
            month = month.replace('<publication_month>', '').replace('</publication_month>', '')
        day = dom.getElementsByTagName('publication_day')[0].toxml()
        if day[-2:] == '/>':
            day = day.replace('<publication_day/>', '')
        else:
            day = day.replace('<publication_day>', '').replace('</publication_day>', '')
        if year == '':
            year = '2013'
        if month == '':
            month = '01'
        if day == '':
            day = '01'
        publishedDate = year+'-'+month+'-'+day+' 00:00:00'

    list['genre']
    list['picture'] = picture
    list['cover'] = picture
    list['publisher'] = publisher
    list['published_date'] = publishedDate
    list['pages'] = pages
    list['isbn'] = isbn
    list['isbn13'] = isbn13
    list['country'] = country
    list['title'] = title
    list['language'] = language
    list['author'] = author

    succes = 'False'

    list_travel = {
        'lat': list['lat'],
        'long': list['long'],
        'user': request.user.id,
        'meta': list['meta'],
        'status': 1,
        'type_user': 1,
        'is_new': 1,
        'address': list['address']

    }
    key = list['key']
    del list['address']
    del list['lat']
    del list['long']
    del list['meta']
    del list['key']

    charArt_1 = 0
    code = ''
    index = 1

    for x in isbn:
        if index <= 10:
            code = code + str(x) + key[charArt_1]
            charArt_1 += 1
        else:
            break

        index += 1

    list['code'] = code[0:10]
    book = models.Book.objects.create(**list)
    book.save()

    if book:
        succes = 'True'
        code = str(book.id) + code
        book.code = code[0:10]
        list_travel['book'] = book
        travel = models.Travel.objects.create(**list_travel)
        travel.save()
        book.save()

    context = {
        'succes': succes,
        'code': book.code

    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def register_title_click(request):
    list =  ast.literal_eval(request.POST['dict'])
    del list['id']
    del list['genre']
    del list['grade']
    author_name = list['author']
    del list['author']
    del list['id_author']

    title_exist = account.Title.objects.filter(db_model.Q(id_google=list['id_google'])|db_model.Q(title=list['title']))

    if not title_exist:
        title = account.Title.objects.create(**list)
        title.save()
        name = str(author_name).replace(' ','+')
        author = create_author(name, title)

        if title:
            context = {
                'succes': 'True',
                'id_title': title.id
            }
        else:
            context = {
                'succes': 'False'
            }
    else:
        context = {
            'succes': 'False'
        }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def register_external_user(request):
    list = request.POST

    list = {
        'name': list['name'],
        'email': list['email']
    }

    external_user = models.ExternalUser.objects.create(**list)
    external_user.save()

    success = 'False'
    id = 0

    if external_user:
        success = 'True',
        id = external_user.id

    context = {
        'success': success,
        'id': id
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def create_author(name_author, title):

    name_aut = str(name_author)
    name = str(name_author).replace(' ','+')
    query = ''
    key = '&key='+settings.GOOGLE_BOOKS_KEY
    search_author = '&limit=1&lang=es&filter=(all+type:%2Fbook%2Fauthor)&output=(%2Fcommon%2Ftopic%2Fimage+%2Fbook%2Fauthor%2Fworks_written+description)'
    url = 'https://www.googleapis.com/freebase/v1/search?query='+name
    query += search_author + key
    url += query
    response = urllib2.urlopen(url)
    response = simplejson.load(response)

    biography = ' '
    picture = ' '
    author = ''

    if str(name_author) != 'autor anonimo':

        if len(response['result']) != 0:
            if len(response['result'][0]['output']) != 0:
                if len(response['result'][0]['output']['description']) != 0:
                    biography = (response['result'][0]['output']['description']['/common/topic/description'][0]).encode('utf-8', 'ignore')

            if len(biography) > 500:
                biography = biography[0:500]

            if len(response['result'][0]['mid']) != 0:
                picture = 'https://www.googleapis.com/freebase/v1/image' + \
                          response['result'][0]['mid'] + '?maxwidth=125&maxheight=125&mode=fillcropmid'

            dict_author = {
                'name': response['result'][0]['name'],
                'picture': picture,
                'biography': biography,
                'birthday': datetime.datetime.today(),
                'id_api' : response['result'][0]['id']
            }

        else:
            dict_author = {
                'name': name_aut,
                'picture': '',
                'birthday': datetime.datetime.today(),
                'id_api': name_aut
            }

        author_exist = account.Author.objects.filter(db_model.Q(id_api=dict_author['id_api']) |
                                                     db_model.Q(name=dict_author['name']))

        if not author_exist:
            author = account.Author.objects.create(**dict_author)
            author.save()
        else:
            author = author_exist[0]

    if title and author:
        list_author_title = account.AuthorTitle.objects.create(title=title, author=author)
        list_author_title.save()

    return author


def recover_password(request):
    email = request.POST.get('email')
    user = models.User.objects.filter(email=email)
    subject = 'Recuperar contraseña Querétaro Lee'
    if user:
        success = 1
        template = get_template('registry/email.html')
        reset_code = hashlib.md5(user[0].username+str(user[0].last_login))
        pass_str = reset_code.hexdigest()
        pass_str = list(pass_str)

        pass_str = pass_str[:3]+list(str(user[0].id))+pass_str[3:]
        pass_str = "".join(pass_str)
        context = Context({
            'user': user[0],
            'code': main_settings.SITE_URL+'registry/reset_password/'+pass_str+'#recover'
        })
        content = template.render(context)
        msg = EmailMessage(
            subject, content,
            from_email=main_settings.EMAIL_HOST_USER,
            to=[email], )
        msg.content_subtype = 'html'
        msg.send()
    else:
        success = 0

    context = {
        'success': success
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def reset_password(request, **kwargs):
    code = kwargs['code']
    u_id = int(code[3])
    user = models.User.objects.filter(
        id=u_id)
    if user:
        u_code = hashlib.md5(user[0].username+str(user[0].last_login))
        u_code = u_code.hexdigest()
        u_code = list(u_code)
        u_code = u_code[:3]+list(str(user[0].id))+u_code[3:]
        u_code = "".join(u_code)
        user = user[0]
        if u_code == code:
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            auth.login(request=request, user=user)
            return HttpResponseRedirect('/accounts/users/edit_profile/'+str(user.id)+'/')
        else:
            return HttpResponseRedirect('/')
    else:
        return HttpResponseRedirect('/')
