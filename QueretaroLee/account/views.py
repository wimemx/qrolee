import urlparse
import urllib
import ast
from django.shortcuts import render
from django.http import HttpResponseRedirect,HttpResponse
from django.contrib import auth
from django.core.context_processors import csrf
import oauth2
import hashlib
import simplejson
from account import models
from registry import models as registry
from django.contrib.auth.models import User
from registry import views as registry_view
from django.db import models as db_model
from datetime import datetime


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


def user_profile(request, **kwargs):
    template = kwargs['template_name']
    id_user =  kwargs['id_user']
    dict_list = {}

    profile = registry.Profile.objects.get(user=id_user)
    entity_user = registry.EntityUser.objects.filter(user=id_user, is_member=True)
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
            annotate(count = db_model.Count('element_id'), score = db_model.Avg('grade'))

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
                if field=='user':
                    value = str(obj.__getattribute__(str(field)))
                    user['id_user'] = int(obj.__getattribute__(str(field)).id)
                else:
                    value = str(obj.__getattribute__(str(field)))
                user[str(field)] = value

        dictionary[int(obj.id)] = user


    user = registry.User.objects.get(id=id_user)
    list_genre = models.ListGenre.objects.filter(list__user=user, status=True)
    titles_read = models.ListTitle.objects.filter(list__default_type=1,
                                                       list__user=user, list__status=True)

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

                author = models.AuthorTitle.objects.filter(title=obj.title)

                activity = models.Activity.objects.get(
                    object=obj.title.id, added_to_object=obj.list.id)
                id_author = 0
                if len(author) != 0:
                    author_name = author[0].author.name
                    id_author = author[0].author.id

                #--------------date------------------------#
                items['default_type'] = obj.list.default_type
                items['id_list'] = obj.id
                items['id_author'] = id_author
                items['date'] = str(activity.date.day) + ' de ' \
                                + str(array_date[(activity.date.month-1)]) + ' ' \
                                + str(activity.date.year)
                items['author'] = author_name
                items['grade'] = grade_title
                items['id_user'] = obj.list.user.id
                dict_items[int(obj.title.id)] = items

            dict_list[int(obj.list.default_type)] = dict_items


    act_title = models.ListTitle.objects.filter(list__user=user,
                                                list__default_type=5)

    if len(act_title) != 0:
        act_title = models.ListTitle.objects.get(list__user=user,
                                                list__default_type=5)
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

    pages = models.Page.objects.filter(id_user=user)

    dict_pages = {}
    for obj in pages:
        items = {}
        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                items[field] = obj.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                items[field] = obj.__getattribute__(str(field))
        items['id_user'] = obj.id_user.id
        dict_pages[int(obj.id)] = items


    context = {
        'user_profile':profile,
        'entities':entity_user,
        'type':'profile',
        'list':dictionary,
        'list_genre':list_genre,
        'list_titles':dict_list,
        'count_titles':len(titles_read),
        'act_title':act_title,
        'pages':dict_pages
    }

    return render(request, template, context)


def user_account(request, **kwargs):
    template = kwargs['template_name']
    id_user =  request.user.id
    user = registry.User.objects.get(id=id_user)
    context = {'user_account':user,'type':'account'}

    return render(request, template, context)


def update_account(request,**kwargs):

    id_user =  request.user.id
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

    id_user =  request.user.id
    field = request.POST.get('field')
    value = request.POST.get('value')

    dictionary = {
        field: value
    }

    fields_related_objects = registry.Profile._meta.get_all_related_objects(
        local_only=True)
    fields = registry.Profile._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = registry.Profile._meta.get_all_field_names()
        fields_foreign = []

    fields = [item for item in fields if item not in fields_foreign]
    dictionary_profile = {}

    obj = registry.Profile.objects.get(user=id_user)

    for field_type in fields:
        if isinstance(obj.__getattribute__(field_type), unicode):
            if dictionary.has_key(str(field_type)):
                dictionary_profile[str(field_type)] = (dictionary[str(field_type)])\
                    .encode('utf-8', 'ignore')
        else:
            if dictionary.has_key(str(field_type)):
                if field_type == 'city':
                    dictionary_profile[str(field_type)] = (dictionary[str(field_type)]).encode('utf-8', 'ignore')
                else:
                    dictionary_profile[str(field_type)] = str(dictionary[str(field_type)])

    if len(dictionary_profile)>0:
        profile = registry.Profile.objects.filter(user=id_user).update(**dictionary_profile)

    fields_related_objects = registry.User._meta.get_all_related_objects(
        local_only=True)
    fields = registry.User._meta.get_all_field_names()
    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = registry.User._meta.get_all_field_names()
        fields_foreign = []

    obj = registry.User.objects.get(id=id_user)
    dictionary_user = {}

    for field_type in fields:
        if field_type=='first_name' or field_type=='last_name' or field_type=='email':
            if isinstance(obj.__getattribute__(field_type), unicode):
                if dictionary.has_key(str(field_type)):
                    dictionary_user[str(field_type)] = (dictionary[str(field_type)]).encode('utf-8', 'ignore')
            else:
                if dictionary.has_key(str(field_type)):
                    dictionary_user[str(field_type)] = str(dictionary[str(field_type)])

    if len(dictionary_user)>0:
        user = registry.User.objects.filter(id=id_user).update(**dictionary_user)

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
    return HttpResponseRedirect('/registry/logout');


def list_user(request):

    user = User.objects.filter(is_staff=False)
    author = models.Author.objects.all()


    if request.POST.get('field_value') != None:
        search = request.POST['field_value']
        user = User.objects.filter(is_staff=False, first_name__icontains=search)
        author = models.Author.objects.filter(name__icontains=search)

    list_us = {}
    list_author = {}

    for obj in user:
        list = {}
        list['id'] = int(obj.id)
        list['first_name'] = str(obj.first_name)
        list['last_name'] = str(obj.last_name)
        profile = registry.Profile.objects.filter(user=obj)
        list['picture'] = profile[0].picture
        list_us[str(obj.id)] = list

    for obj in author:
        list = {}
        list['id'] = int(obj.id)
        list['first_name'] = str(obj.name)
        list_author[str(obj.id)] = list
        list['picture'] = obj.picture

    context = {
        'users':list_us,
        'author':list_author
    }

    context = simplejson.dumps(context)

    return HttpResponse(context, mimetype='application/json')


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
            copy[e] = str(val[0])
    pages = copy
    pages['id_user'] = user
    pages['date'] = datetime.today()

    page = models.Page.objects.create(**pages)
    page.save()

    if list is not None:
        succuess = 'True'
        activity_data = {
            'user_id': request.user.id,
            'object':page.id,
            'type': 'P',
            'activity_id': 1
        }
        registry_view.update_activity(activity_data)
    else:
        succuess = 'False'
    context = {
        'success': succuess
    }

    context = simplejson.dumps(context)

    return HttpResponse(context, mimetype='application/json')


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
            copy[e] = str(val[0])
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
            registry_view.update_activity(activity_data)
        else:
            activity.update(date=datetime.today())

    context = {
        'success':success
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')
