import urlparse
import urllib
import ast
import oauth2
import hashlib
import simplejson
from account import models
from registry import models as registry
from datetime import datetime
from registry import views as registry_view

from django.contrib.auth.decorators import login_required
from django.db import models as db_model
from django.shortcuts import render
from django.http import HttpResponseRedirect,HttpResponse
from django.contrib import auth
from django.core.context_processors import csrf
from django.contrib.auth.models import User



# Create your views here.
from registry import settings


def login(request, **kwargs):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/home')

    template = kwargs['template_name']
    error = None

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
                if user.is_active:
                    auth.login(request, user)
                    return HttpResponseRedirect('/home')
                else:
                    error = 'AUTH_DISABLED'
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
                    return HttpResponseRedirect('/home')
                else:
                    error = 'AUTH_DISABLED'
            else:
                error = 'AUTH_FAILED'
        elif 'login' in request.GET:
            username = request.POST.get('username', '')
            password = request.POST.get('password', '')
            user = auth.authenticate(username=username, password=password)

            if user is not None:
                auth.login(request, user)
                return HttpResponseRedirect('/home?login=false')
            else:
                error = 'INVALID_CREDENTIALS'

        elif 'error_reason' in request.GET:
            error = 'AUTH_DENIED'

    context = {'settings': settings, 'error': error}
    context.update(csrf(request))
    return render(request, template, context)


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect('/')


@login_required(login_url='/')
def user_profile(request, **kwargs):
    template = kwargs['template_name']
    id_user = kwargs['id_user']

    if len(str(id_user).split('b')) > 1:
        id_ = str(id_user).split('b')
        id_user = int(id_[0])


    if request.POST:
        membership = registry.MemberToObject.objects.get_or_create(
            user_id=request.user.id, object_type='U', object=id_user)[0]

        activity_id = 5
        if int(request.POST.get('membership')) == -1:
            membership.is_member = False
            activity_id = 10
        else:
            membership.is_member = True
        activity_data = {
            'user_id': request.user.id,
            'object': id_user,
            'added_to_object': request.user.id,
            'type': 'U',
            'added_to_type': 'U',
            'activity_id': activity_id
        }
        registry_view.update_activity(activity_data)

        membership.save()

    member = registry.MemberToObject.objects.filter(
        user=request.user.id, is_member=True, object_type='U', object=id_user)
    followers = registry.MemberToObject.objects.filter(
        is_member=True, object_type='U', object=id_user)

    dict_list = {}
    profile = registry.Profile.objects.get(user=id_user)
    entity_user = registry.MemberToObject.objects.filter(
        user=id_user, is_member=True, object_type='E')

    dict_entities_user = {}

    for obj in entity_user:
        entity = registry.Entity.objects.get(id=obj.object)
        count_members = registry.MemberToObject.objects.filter(object=obj.object)
        is_admin = registry.MemberToObject.objects.get(object_type='E', object=obj.object, user__id=id_user)
        att = {
            'entity': entity,
            'followers': count_members,
            'is_admin': is_admin
        }
        if entity.type.name == 'group':
            dict_entities_user[int(obj.object)] = att

    list = models.List.objects.filter(user=id_user, default_type=-1, status=True)

    fields_related_objects = models.List._meta.get_all_related_objects(
        local_only=True)
    fields = models.List._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = models.List._meta.get_all_field_names()
        fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    dictionary = dict()

    for obj in list:

        user = {}
        count = 0

        if obj.type == 'T':
            titles = models.ListTitle.objects.filter(list=obj)
            count = len(titles)

        if obj.type == 'A':
            authors = models.ListAuthor.objects.filter(list=obj)
            count = len(authors)

        grade_title = 0
        rate_title = models.Rate.objects.filter(element_id=obj.id).values('element_id').\
            annotate(count=db_model.Count('element_id'), score = db_model.Avg('grade'))

        if len(rate_title) != 0:
            grade_title = rate_title[0]['score']

        user['count'] = count
        user['type'] = obj.type
        user['grade'] = grade_title

        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                user[str(field)] = obj.__getattribute__(str(field)).\
                    encode('utf-8', 'ignore')
            else:
                if field =='user':
                    value = str(obj.__getattribute__(str(field)))
                    user['id_user'] = int(obj.__getattribute__(str(field)).id)
                else:
                    value = str(obj.__getattribute__(str(field)))
                user[str(field)] = value

        dictionary[int(obj.id)] = user

    user = registry.User.objects.get(id=id_user)
    list_genre = models.ListGenre.objects.filter(list__user=user, status=True)
    titles_read = models.ListTitle.objects.filter(
        list__default_type=1, list__user=user, list__status=True)

    fields_related_objects = models.Title._meta.get_all_related_objects(
        local_only=True)
    fields = models.Title._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    array_date = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

    for i in range(3):
        list_titles = models.ListTitle.objects.filter(list__default_type=i,
                                        list__user=user, list__status=True)

        dict_items = {}
        for obj in list_titles:
            items = {}
            for field in fields:
                if isinstance(obj.title.__getattribute__(str(field)), unicode):
                    items[field] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    items[field] = obj.title.__getattribute__(str(field))

                grade_title = 0
                rate_title = models.Rate.objects.filter(element_id=obj.title.id).\
                    values('element_id').\
                annotate(
                    count=db_model.Count('element_id'), score=db_model.Avg('grade'))

                if len(rate_title) != 0:
                    grade_title = rate_title[0]['score']

                author_name = 'autor anonimo'

                author =  models.AuthorTitle.objects.filter(title=obj.title)
                activity = models.Activity.objects.filter(object=obj.title.id,
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

    act_title = models.ListTitle.objects.filter(
        list__user=user, list__default_type=5)

    if len(act_title) != 0:
        act_title = models.ListTitle.objects.get(
            list__user=user, list__default_type=5)
    else:
        act_title = 0

    fields_related_objects = models.Page._meta.get_all_related_objects(
        local_only=True)
    fields = models.Page._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    pages = models.Page.objects.filter(user_id=user, status=True)

    dict_pages = {}
    for obj in pages:
        items = {}
        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                items[field] = obj.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                items[field] = obj.__getattribute__(str(field))
        items['id_user'] = obj.user.id
        items['name_user'] = obj.user.username
        dict_pages[int(obj.id)] = items

    city = profile.city
    if city:
        city = city.split('#')
        if len(city) > 1:
            city = city[1]

    activity = models.Activity.objects.filter(
        user_id=profile.user_id).order_by('-date')

    birthday = profile.birthday
    if birthday:
        birthday =  str(birthday.day) + '-' + str(array_date[birthday.month-1]) +\
              '-' + str(birthday.year)

    context = {
        'user_profile': profile,
        'entities': dict_entities_user,
        'type': 'profile',
        'list': dictionary,
        'list_genre': list_genre,
        'list_titles': dict_list,
        'count_titles': len(titles_read),
        'act_title': act_title,
        'pages': dict_pages,
        'member': member,
        'followers': followers,
        'activity': activity,
        'city': city,
        'birthday': birthday
    }
    #print dict_entities_user
    return render(request, template, context)


@login_required(login_url='/')
def user_account(request, **kwargs):
    template = kwargs['template_name']
    id_user =  request.user.id
    user = registry.User.objects.get(id=id_user)
    context = {'user_account':user,'type':'account'}

    return render(request, template, context)


@login_required(login_url='/')
def update_account(request,**kwargs):

    id_user = request.user.id
    field = request.POST.get('field')
    value = request.POST.get('value')

    dictionary = {
        field: value
    }
    if dictionary.has_key('password'):
        dictionary[field] = str(hashlib.md5(request.POST.get('value')).hexdigest())

    account = registry.User.objects.filter(id=id_user).update(**dictionary)

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def update_profile(request, **kwargs):

    id_user = request.user.id
    field = request.POST.get('field')
    value = request.POST.get('value')

    dictionary = {
        field: value
    }

    fields_related_objects = registry.Profile._meta.get_all_related_objects(
        local_only=True)
    profile_fields = registry.Profile._meta.get_all_field_names()

    if field in profile_fields:
        profile = registry.Profile.objects.filter(user=id_user).update(**dictionary)
    else:
        user = registry.User.objects.filter(id=id_user).update(**dictionary)

    context = {}
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def delete_account(request):
    id_user = request.user.id
    profile = registry.Profile.objects.get(user=id_user)
    profile.status = False
    profile.save()
    user = registry.User.objects.get(id=id_user)
    user.is_active = False
    user.save()

    context = {}
    context = simplejson.dumps(context)
    return HttpResponseRedirect('/registry/logout')


def list_user(request):

    user = User.objects.filter(is_active=True, is_staff=False)
    author = models.Author.objects.all()
    org = registry.Entity.objects.filter(type__name='organization')
    group = registry.Entity.objects.filter(type__name='group')
    spot = registry.Entity.objects.filter(type__name='spot')
    list_ = models.List.objects.filter(default_type=-1)
    title = models.Title.objects.all()

    if request.POST.get('field_value') != None:
        search = request.POST['field_value']
        user = User.objects.filter(
            db_model.Q(username__icontains=search) |
            db_model.Q(first_name__icontains=search)|db_model.Q(last_name__icontains=search)).\
            filter(is_active=True, is_staff=False)

        author = models.Author.objects.filter(name__icontains=search)
        org = registry.Entity.objects.filter(name__icontains=search,
                                                           type__name='organization')
        group = registry.Entity.objects.filter(name__icontains=search,
                                                           type__name='group')
        spot = registry.Entity.objects.filter(name__icontains=search,
                                                           type__name='spot')
        list_ = models.List.objects.filter(name__icontains=search, default_type=-1)
        title = models.Title.objects.filter(title__icontains=search)

    list_us = {}
    list_author = {}
    list_org = {}
    list_group = {}
    list_spot = {}
    list_lis = {}
    list_title = {}

    for obj in user:
        list = {}
        list['id'] = int(obj.id)
        name = ''
        if not obj.first_name:
            name = (obj.username).encode('utf-8', 'ignore')
        else:
            name = (obj.first_name).encode('utf-8', 'ignore')

        list['name'] = name
        list['name_2'] = (obj.last_name).encode('utf-8', 'ignore')
        profile = registry.Profile.objects.filter(user=obj)
        picture = ''
        if profile[0].picture:
           picture = profile[0].picture
        list['picture'] = picture
        list_us[str(obj.id)] = list

    for obj in author:
        list = {}
        list['id'] = int(obj.id)
        list['name'] = (obj.name).encode('utf-8', 'ignore')
        list['picture'] = obj.picture
        list_author[str(obj.id)] = list

    for obj in org:
        list = {}
        list['id'] = int(obj.id)
        list['name'] = (obj.name).encode('utf-8', 'ignore')
        list['picture'] = obj.picture
        list['id_user'] = obj.user.id
        list_org[str(obj.id)] = list

    for obj in group:
        list = {}
        list['id'] = int(obj.id)
        list['name'] = (obj.name).encode('utf-8', 'ignore')
        list['picture'] = obj.picture
        list['id_user'] = obj.user.id
        list_group[str(obj.id)] = list

    for obj in spot:
        list = {}
        list['id'] = int(obj.id)
        list['name'] = (obj.name).encode('utf-8', 'ignore')
        list['picture'] = obj.picture
        list['id_user'] = obj.user.id
        list_spot[str(obj.id)] = list

    for obj in list_:
        list = {}
        list['id'] = int(obj.id)
        list['name'] = (obj.name).encode('utf-8', 'ignore')
        list['picture'] = obj.picture
        list['id_user'] = obj.user.id
        list_lis[str(obj.id)] = list

    for obj in title:
        list = {}
        list['id'] = int(obj.id)
        list['name'] = (obj.title).encode('utf-8', 'ignore')
        list['picture'] = obj.picture
        list_title[str(obj.id)] = list

    context = {
        'users':list_us,
        'author':list_author,
        'org':list_org,
        'group':list_group,
        'spot':list_spot,
        'list':list_lis,
        'title':list_title
    }

    context = simplejson.dumps(context)

    return HttpResponse(context, mimetype='application/json')


@login_required(login_url='/')
def registry_page(request, **kwargs):
    template_name = kwargs['template_name']
    user = request.user
    profile = registry.Profile.objects.get(user=user)
    context = {
        'profile':profile
    }

    return render(request, template_name, context)


def registry_ajax_page(request):

    user = request.user
    pages = dict(request.POST)

    del pages['csrfmiddlewaretoken']
    copy = pages
    for e, val in pages.iteritems():
            copy[e] = str(val[0].encode('utf-8', 'ignore'))
    pages = copy
    pages['user'] = user
    pages['date'] = datetime.today()

    page = models.Page.objects.create(**pages)
    page.save()

    if list is not None:
        context = {
            'success': 'True',
            'page_id': page.id,
            'user_id': page.user.id
        }
        '''activity_data = {
            'user_id': request.user.id,
            'object': page.id,
            'type': 'P',
            'activity_id': 1
        }
        registry_view.update_activity(activity_data)'''
    else:
        context = {
            'success': 'False'
        }

    context = simplejson.dumps(context)

    return HttpResponse(context, mimetype='application/json')


@login_required(login_url='/')
def update_page(request, **kwargs):
    template_name = kwargs['template_name']
    id_page = kwargs['id_page']
    user = request.user
    page = models.Page.objects.get(id=id_page)
    profile = registry.Profile.objects.get(user=user)

    context = {
        'page':page,
        'profile':profile
    }
    return render(request, template_name, context)


def update_ajax_page(request):
    user = request.user
    pages = dict(request.POST)

    del pages['csrfmiddlewaretoken']
    copy = pages
    for e, val in pages.iteritems():
            copy[e] = val[0]
    pages = copy
    id_page = pages['id_page']
    del pages['id_page']
    page = models.Page.objects.filter(id=id_page)
    page.update(**pages)

    success = 'False'
    if page is not None:
        success = 'True'
        activity =  models.Activity.objects.filter(object=page[0].id, user_id=user.id,
                                    activity_id=2, type='P')
        if len(activity) == 0:
            activity_data = {
                'user_id': request.user.id,
                'object':page[0].id,
                'type': 'P',
                'activity_id': 2
            }
            #registry_view.update_activity(activity_data)
        else:
            activity.update(date=datetime.today())

    context = {
        'success': success,
        'page_id': id_page,
        'user_id': request.user.id
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')
