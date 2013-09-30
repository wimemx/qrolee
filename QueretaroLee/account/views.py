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
from django.db import models as db_model


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

    profile = registry.Profile.objects.get(user=id_user)
    entity_user = registry.EntityUser.objects.filter(user=id_user, is_member=True)
    list = models.List.objects.filter(user=id_user, default_type=-1, status=True)
    user = registry.User.objects.get(id=id_user)
    list_genre = models.ListGenre.objects.filter(list__user=user, status=True)
    titles_read = models.ListTitle.objects.filter(list__default_type=1,
                                                       list__user=user, list__status=True)
    titles_to_read = models.ListTitle.objects.filter(list__default_type=2,
                                                       list__user=user, list__status=True)
    titles_favorites = models.ListTitle.objects.filter(list__default_type=0,
                                                       list__user=user, list__status=True)

    list_rate = models.Rate.objects.all().values('element_id').\
        annotate(count = db_model.Count('element_id'),
                 score = db_model.Avg('grade'))

    act_title = models.ListTitle.objects.filter(list__user=user,
                                                list__default_type=5)

    if len(act_title) != 0:
        act_title = models.ListTitle.objects.get(list__user=user,
                                                list__default_type=5)
    else:
        act_title = 0


    context = {
        'user_profile':profile,
        'entities':entity_user,
        'type':'profile',
        'list':list,
        'list_genre':list_genre,
        'list_title_favorite':titles_favorites,
        'list_title_read':titles_read,
        'list_title_to_read':titles_to_read,
        'count_titles':len(titles_read),
        'list_rate':list_rate,
        'act_title':act_title
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
    print dictionary
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


    context = {'users':list_us,'author':list_author}

    context = simplejson.dumps(context)

    return HttpResponse(context, mimetype='application/json')
