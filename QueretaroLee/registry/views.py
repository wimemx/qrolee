from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import auth
from django.contrib.auth import models as auth_models
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.core import serializers
from account import models as account
from registry import models, settings
from decimal import Decimal
from QueretaroLee import settings as main_settings
import calendar
import os
import urlparse
import urllib
import ast
import simplejson
import oauth2
import hashlib
import HTMLParser
import datetime



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

            url = 'https://graph.facebook.com/oauth/access_token?' + \
                    urllib.urlencode(args)
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

    if user != None:
        active = models.User.objects.get(id=user.id)
        active = active.is_active

        if active:
            if user is not None:
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
    user_exits = auth_models.User.objects.filter(
        Q(email=user['email'][0]) | Q(username=user['username'][0]))

    if user['password'] != user['password_match']:
        success = 'False'

    else:

        if len(user_exits) > 0:
            success = 'False'
            url = 'Usario ya existente'
        else:
            password_md5 = hashlib.md5(request.POST.get('password')).hexdigest()
            del user['password']
            del user['password_match']
            del user['csrfmiddlewaretoken']
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
            url = main_settings.SITE_URL+'qro_lee/'

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
    content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. ' \
                  'Aenean ultricies mi vitae est. Mauris placerat eleifend leo.' \
                  ' Quisque sit amet est et sapien ullamcorper pharetra. ' \
                  'Vestibulum erat wisi, condimentum sed, commodo vitae, ' \
                  'ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt ' \
                  'condimentum, eros ipsum rutrum orci, sagittis tempus lacus ' \
                  'enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. ' \
                  'Praesent dapibus, neque id cursus faucibus, tortor neque ' \
                  'egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. ' \
                  'Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'

    if entity_type == 'group':
        entity_type = ['Crear un nuevo grupo', 'group','grupo']
    elif entity_type == 'organization':
        entity_type = ['Crear una nueva organizacion', 'organization','organizacion']
    elif entity_type == 'spot':
        entity_type = ['Crear un nuevo spot', 'spot','spot']

    context = {
        'entity_type': entity_type,
        'content': content,
        'categories': categories

    }
    return render(request, template, context)


def register(request):
    user = request.user
    entity = dict(request.POST)
    type = models.Type.objects.get(name=entity['entity_type'][0])
    category = models.Category.objects.get(name=entity['category_id'][0])
    entity['user_id'] = int(user.id)
    entity['type_id'] = int(type.id)
    entity['category_id'] = int(category.id)
    if entity['privacy'][0] == 'publica':
        entity['privacy'] = 0
    else:
        entity['privacy'] = 1
    del entity['csrfmiddlewaretoken']
    del entity['entity_type']
    del entity['fb_id']
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
    print 6
    entity = models.Entity.objects.create(**entity)
    entity.save()
    if entity is not None:
        succuess = entity.id
    else:
        succuess = 'False'
    context = {
        'success': succuess
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def edit_entity(request, **kwargs):
    template = kwargs['template_name']
    id_entity = kwargs['entity'].split('_', 1)
    user = request.user
    entity = models.Entity.objects.filter(id=int(id_entity[1]))
    if len(entity) != 0:

        entity = models.Entity.objects.get(
            pk=int(id_entity[1]))

        if entity.user == user:

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
    else:
        return not_found(request)


def delete_entity(request,**kwargs):

    id_entity = kwargs['entity'].split('_', 1)
    entity = models.Entity.objects.get(id=id_entity[1])
    entity.status = False
    entity.save()
    list_events = models.Event.objects.filter(location_id=id_entity[1]).\
        update(status=False)

    return HttpResponseRedirect("/qro_lee/entities/"+kwargs['entity_type'])


def update_entity(request, **kwargs):
    field = request.POST.get('field')
    value = request.POST.get('value')
    if field == 'privacy':
        if value == 'publica':
            value = 0
        else:
            value = 1
    elif field == 'share_fb' or field == 'share_twitter':
        value = int(value)

    dictionary = {
        field: value
    }

    if request.POST.get('event') == '1' and request.POST.get('event') is not None:
        event = models.Event.objects.filter(
            id=kwargs['entity_id']).update(**dictionary)
    else:
        entity = models.Entity.objects.filter(
            id=kwargs['entity_id']).update(**dictionary)

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect('/')

def media_upload(request):

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

    if 'list_picture' in  request.POST:
        folder = '/list/'

    path_extension = str(request.user.id)+folder
    path = os.path.join(
        os.path.dirname(__file__), '..',
        'static/media/users/'+path_extension).replace('\\', '/')

    path += str(request.FILES['file'])
    file = request.FILES['file']
    handle_uploaded_file(path, file)
    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')

def handle_uploaded_file(destination, f):
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
    profile = models.Profile.objects.filter(
        user__id=request.user.id)
    if entity_type == 'group':
        entity_type = ['grupos', 'group']
    elif entity_type == 'spot':
        entity_type = ['spots', 'spot']
    else:
        entity_type == 'organization'
        entity_type = ['organizaciones', 'organization']
    context = {
        'profile': profile[0],
        'entity': entity,
        'entity_type': entity_type
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

    event = copy
    event = models.Event.objects.create(**event)
    post_event_fb(event, request.user, profile)
    event.save()
    if event is not None:
        success = 'True'
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
    id_entity =  kwargs['entity'].split('_', 1)
    id_entity = id_entity[1]
    events = models.Event.objects.filter(location_id=id_entity)
    name = models.Entity.objects.get(id=id_entity)
    events_months = []

    for event in events:
        # Event date = Month, day, id
        event_date = []
        event_date.append(event.start_time.month)
        event_date.append(event.start_time.day)
        event_date.append(int(event.id))
        events_months.append(event_date)
    hc = calendar.HTMLCalendar(calendar.SUNDAY)
    hc = hc.formatyear(datetime.datetime.now().year)
    hc = hc.replace('Sun', 'D')
    hc = hc.replace('Mon', 'L')
    hc = hc.replace('Tue', 'M')
    hc = hc.replace('Wed', 'M')
    hc = hc.replace('Thu', 'J')
    hc = hc.replace('Fri', 'V')
    hc = hc.replace('Sat', 'S')

    html_parser = HTMLParser.HTMLParser()
    unescaped = html_parser.unescape(hc)

    context = {
        'entity_type': name.type,
        'entity': name,
        'calendar': unescaped,
        'id_entity':id_entity
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
            events.append(event_data)
    context = {
        'events': list(events)
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')

def edit_event(request, **kwargs):
    template = kwargs['template_name']
    obj = kwargs['entity'].split('_', 1)
    obj = models.Event.objects.get(
        pk=int(obj[1]))

    context = {
        'entity': obj
    }
    return render(request, template, context)

def admin_users(request, **kwargs):
    template = kwargs['template_name']
    obj = kwargs['entity'].split('_', 1)
    obj = models.Entity.objects.get(
        pk=int(obj[1]))
    entity_type = models.Type.objects.get(
        entity__id=obj.id)
    members = models.EntityUser.objects.filter(
        entity_id=obj.id).filter(is_admin=True)
    users = list()
    for member in members:
        users.append(member.user_id)

    members = models.User.objects.filter(
        id__in=users)
    context = {
        'members': members,
        'entity_type': entity_type,
        'entity': obj
    }
    return render(request, template, context)

def remove_add_user(request, **kwargs):
    if 'user_email' in request.POST:
        members = models.EntityUser.objects.filter(
            entity_id=int(request.POST.get('entity')),
            is_admin=1)
        users = list()
        users.append(request.user.id)
        for member in members:
            users.append(member.user_id)
        if request.POST.get('user_email') == '-1':
            members = models.EntityUser.objects.filter(
                entity_id=int(request.POST.get('entity'))).filter(is_admin=True)
            users = list()
            for member in members:
                users.append(member.user_id)
            objs = models.User.objects.filter(
                id__in=users)
        else:
            objs = models.User.objects.filter(
                email__icontains=request.POST.get('user_email')).exclude(id__in=users)
        users = list()

        users = list()
        for obj in objs:

            obj_data = list()
            profile = models.Profile.objects.filter(
                user_id=obj.id)
            for data in profile:
                obj_data.append(data.picture)
            obj_data.append(obj.id)
            obj_data.append(obj.username)
            obj_data.append(datetime.datetime.now().month - obj.date_joined.month)
            users.append(obj_data)

        context = {
            'users': users
        }
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')
    else:
        obj = kwargs['user_id']
        obj = models.EntityUser.objects.get_or_create(
            user_id=int(obj),
            entity_id=int(request.POST.get('entity')))[0]

        if int(request.POST.get('remove')) == 1:
            obj.is_admin = 0
        else:
            obj.is_admin = 1
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
            t = datetime.datetime(*t_tuple[:6])
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


def join_entity(request, **kwargs):
    id_entity =  kwargs['entity'].split("_")
    id_user = int(request.user.id)
    entity = models.Entity.objects.get(id=int(id_entity[1]))
    user = models.User.objects.get(id=id_user)
    dictionary = {'entity':entity, 'user':user,
                  'is_admin':False, 'is_member':True}
    #entity_user = models.EntityUser.objects.create(**dictionary)

    return HttpResponseRedirect('/qro_lee/entity/group/'+kwargs['entity'])


def unjoin_entity(request, **kwargs):
    id_entity =  kwargs['entity'].split("_")
    id_user = int(request.user.id)
    entity = models.Entity.objects.get(id=int(id_entity[1]))
    user = models.User.objects.get(id=id_user)
    entity_user = models.EntityUser.objects.get(entity=entity)
    entity_user.is_member = False
    entity_user.save()

    return HttpResponseRedirect('/qro_lee/entity/group/'+kwargs['entity'])


def registry_list(request,**kwargs):
    id_user = int(request.user.id)
    template = kwargs['template_name']
    context = {}
    return render(request, template, context)


def register_ajax_list(request):
    user = request.user
    list = dict(request.POST)
    del list['csrfmiddlewaretoken']
    del list['type']

    copy = list
    for e, val in list.iteritems():
            copy[e] = str(val[0])

    list = copy
    user = request.user
    list['user'] = user
    list['date'] = datetime.datetime.today()
    list['status'] = True
    list['type'] = 'T'
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
    if len(genre_status)==0:
        list = account.List.objects.get(user=user, type='G')
        dictionary = {
            'genre':genre,
            'list':list
        }
        genre_user = account.ListGenre.objects.create(**dictionary)
        genre_user.save()
    else:
        genre_user = account.ListGenre.objects.get(genre=genre, list__user=user)
        print genre_user.status
        if genre_user.status:
            genre_user.status = False
        else:
            genre_user.status = True
        genre_user.save()

    context =  {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def delete_title(request):

    user = request.user
    id_title = request.POST.get('id_title')
    type = request.POST.get('type')
    title_favorite = account.ListTitle.objects.get(title__id=id_title,
                                                   list__default_type=type)
    title_favorite.delete()

    context = {}
    context = simplejson.dumps(context)
    return  HttpResponse(context, mimetype='application/json')


def delete_list(request):

    id_list = request.POST.get('id_list')
    list = account.List.objects.get(id=id_list)
    list.status = False
    list.save()

    context = {}
    context = simplejson.dumps(context)
    return  HttpResponse(context, mimetype='application/json')


def add_rate(request):

    user = request.user
    type = request.POST.get('type')
    grade = request.POST.get('grade')
    element_id = request.POST.get('element_id')

    print element_id
    list = {
        'type':str(type),
        'grade':int(grade),
        'user':user,
        'element_id':int(element_id)
    }
    print list
    rate_user = account.Rate.objects.create(**list)
    #rate_user.save()

    count_rate = account.Rate.objects.filter(element_id=element_id)
    my_count = account.Rate.objects.get(user=user, element_id=element_id)

    count = 0
    for obj in count_rate:
        count = count + obj.grade

    count_grade = Decimal(count)/(len(count_rate))

    context = {
        'count':len(count_rate),
        'count_grade':str(count_grade),
        'my_count_grade':my_count.grade
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def create_default_list(user):
    dict_list = {
                'name':'Mis libros leidos',
                'type':'T',
                'default_type':1,
                'status':True,
                'description':'texto',
                'privacy':False,
                'user':user,
                'picture':''
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


def not_found(request):
    return HttpResponseRedirect('/qro_lee/')


def add_my_title(request):

    user = request.user

    list_id_titles = []

    if request.POST.get('list') != None:

        list = ast.literal_eval(request.POST.get('list'))

        for obj in list:

            if obj['it']['id'] == -1:

                date = str(obj['it']['attribute']['publishedDate']).split("-")
                date_time = str(obj['it']['attribute']['publishedDate'])

                if len(date) < 3 :
                    date_time = str(date[0]) + '-01-01'

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
                    'description':str(obj['it']['attribute']['description'])
                }

                title = account.Title.objects.create(**li)
                title.save()

            else:
                title = account.Title.objects.get(id=obj['it']['id'])

            list_id_titles.append(int(title.id))

            if int(request.POST.get('type')) == 1 |\
                    int(request.POST.get('type')) == 3:

                for type in obj['it']['default_type']:
                    lista = account.List.objects.get(user=user, default_type=type)

                    list_ti = {
                        'list':lista,
                        'title':title
                    }
                    my_list = account.ListTitle.objects.create(**list_ti)
                    my_list.save()

    fields_related_objects = account.Title._meta.get_all_related_objects(
    local_only=True)
    fields = account.Title._meta.get_all_field_names()

    fields_foreign = []
    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    list_favorite = account.ListTitle.objects.filter(list__user=user,
                                                     list__default_type=0)
    list_read = account.ListTitle.objects.filter(list__user=user,
                                                     list__default_type=1)
    list_to_read = account.ListTitle.objects.filter(list__user=user,
                                                     list__default_type=2)
    list_dict = {}
    my_list = {}

    for obj in list_favorite:
        fields_title = {}
        for field in fields:
            if isinstance(obj.title.__getattribute__(str(field)), unicode):
                fields_title[str(field)] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                fields_title[str(field)] = str(obj.title.__getattribute__(str(field)))

        my_list[int(obj.id)] = fields_title

    list_dict['book_favorite'] = my_list
    my_list = {}

    for obj in list_read:
        fields_title = {}
        for field in fields:
            if isinstance(obj.title.__getattribute__(str(field)), unicode):
                fields_title[str(field)] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                fields_title[str(field)] = str(obj.title.__getattribute__(str(field)))

        my_list[int(obj.id)] = fields_title

    list_dict['book_read'] = my_list
    my_list = {}

    for obj in list_to_read:
        fields_title = {}
        for field in fields:
            if isinstance(obj.title.__getattribute__(str(field)), unicode):
                fields_title[str(field)] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                fields_title[str(field)] = str(obj.title.__getattribute__(str(field)))

    list_dict['book_for_reading'] = my_list

    context = simplejson.dumps(list_dict)

    if int(request.POST.get('type')) == 2:
        context = simplejson.dumps(list_id_titles)

    return HttpResponse(context, mimetype='application/json')


def add_titles_author_list(request):
    user = request.user
    id_list = request.POST.get('id_list')
    type = request.POST.get('type')
    list = ast.literal_eval(request.POST.get('list'))
    my_list = account.List.objects.get(id=id_list)
    name = my_list.name.replace(' ','')

    if type == 'T':

        for obj in list:

            title = account.Title.objects.get(id=int(obj))

            list_title = {
                'title':title,
                'list':my_list
            }
            rel_list = account.ListTitle.objects.create(**list_title)
            rel_list.save()

    #context = {}
    #context = simplejson.dumps(context)
    return HttpResponseRedirect('/qro_lee/profile/list/' + name + '_' + id_list + '/')


def edit_list(request, **kwargs):

    id_list = kwargs['list'].split('_')

    list = account.List.objects.get(id=id_list[1])

    template = kwargs['template_name']

    context = {
        'list':list
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
