# -*- encoding: utf-8 -*-
from django.contrib.auth import models as auth_models
from django.contrib.auth.models import User

from registry import models as users_models, settings
from account import models as account
from registry import views as registry_view

import oauth2
import urlparse
import os
import urllib
import urllib2
from requests_oauthlib import OAuth1
import requests
import ast
import unicodedata


def user_exists(email=None, username=None, user=None):
    if (username is None) and (user is None):
        if User.objects.filter(email=email).count():
            return True
        return False
    elif (email is None) and (user is None):
        if User.objects.filter(username=username).count():
            return True
        return False
    else:
        if User.objects.filter(id=user).count():
            return True
        return False


class FacebookBackend:
    def authenticate(self, token=None):
        user = None
        facebook_session = users_models.FacebookSession.objects.get(
            access_token=token,
        )
        profile = facebook_session.query('me')
        facebook_session.uid = profile['id']
        userExists = user_exists(email=profile['email'])

        if userExists:
            user = auth_models.User.objects.get(email=profile['email'])
            user_profile = users_models.Profile.objects.get(user_id=user.id)
            user_profile.social_session = 1
            user_profile.save()
        else:
            userExists = user_exists(username=profile['username'])
            user, created = auth_models.User.objects.get_or_create(
                email=profile['email'], username='temp')

            if userExists:
                user.username = profile['username']+profile['id']
            else:
                user.username = profile['username']
            user.set_unusable_password()
            user.first_name = profile['first_name']
            user.last_name = profile['last_name']
            user.save()
            user_profile = users_models.Profile.objects.create(user_id=user.id)
            user_profile.fb_username = profile['username']
            user_profile.fb_id = profile['id']
            user_profile.phone = ''
            user_profile.social_session = 1
            registry_view.create_default_list(user)
            path = os.path.join(os.path.dirname(__file__), '..', 'static/media/users').replace('\\','/')
            os.mkdir(path+'/'+str(user.id), 0777)
            os.mkdir(path+'/'+str(user.id)+'/profile', 0777)
            os.mkdir(path+'/'+str(user.id)+'/entity', 0777)
            os.mkdir(path+'/'+str(user.id)+'/event', 0777)
            os.mkdir(path+'/'+str(user.id)+'/list/', 0777)
            fb_pic = 'https://graph.facebook.com/'+str(profile['id'])+'/picture?width=200'
            response = urllib2.urlopen(fb_pic)
            fb_pic = response.geturl()
            path = os.path.join(os.path.dirname(__file__), '..', 'static/media/users').replace('\\','/')
            path += '/'+str(user.id)+'/profile/'
            file_name = fb_pic.split('/')
            file_name = file_name[-1]
            urllib.urlretrieve(fb_pic, os.path.join(path, file_name))
            user_profile.picture = file_name
            user_profile.save()
        facebook_session.user_id = user.id
        facebook_session.save()

        return user

    def get_user(self, user_id):

        try:
            return auth_models.User.objects.get(pk=user_id)
        except auth_models.User.DoesNotExist:
            return None


class TwitterBackend:
    def authenticate(self, oauth_verifier=None, request_token=None):

        consumer = oauth2.Consumer(settings.TWITTER_KEY, settings.TWITTER_SECRET)
        token = oauth2.Token(request_token['oauth_token'],
                             request_token['oauth_token_secret'])
        token.set_verifier(oauth_verifier)

        client = oauth2.Client(consumer, token)

        resp, content = client.request(settings.TWITTER_ACCESS_URL, "POST")
        if resp['status'] != '200':
            return None

        access_token = dict(urlparse.parse_qsl(content))
        print access_token
        username = access_token['screen_name']
        uid = access_token['user_id']
        userExists = user_exists(username=username)

        consumer = oauth2.Consumer(settings.TWITTER_KEY, settings.TWITTER_SECRET)
        token = oauth2.Token(settings.TWITTER_TOKEN, settings.TWITTER_TOKEN_SECRET)
        token.set_verifier(oauth_verifier)
        client = oauth2.Client(consumer, token)
        resp, content = client.request('https://api.twitter.com/1.1/search/tweets.json?q='+username)
        content = content.split('"')
        name = str(content[57])

        name = name.split(' ')
        if len(name) > 1:
            last_name = name[1]
            name = name[0]
        else:
            name = name[0]
            last_name = ''
        name = unicode(name, 'unicode-escape')
        last_name = unicode(last_name, 'unicode-escape')
        if userExists:
            user = auth_models.User.objects.get(username=username)

        else:
            user, created = auth_models.User.objects.get_or_create(
                username=username, first_name=name, last_name=last_name
            )
            user.set_unusable_password()
            user.save()
            user_profile = users_models.Profile.objects.create(user_id=user.id)
            user_profile.twitter_username = access_token['screen_name']
            user_profile.twitter_id = access_token['user_id']
            user_profile.phone = ''
            user_profile.social_session = 0
            user_profile.save()
            registry_view.create_default_list(user)
            path = os.path.join(os.path.dirname(__file__), '..', 'static/media/users').replace('\\','/')
            os.mkdir(path+'/'+str(user.id), 0777)
            os.mkdir(path+'/'+str(user.id)+'/profile', 0777)
            os.mkdir(path+'/'+str(user.id)+'/entity', 0777)
            os.mkdir(path+'/'+str(user.id)+'/event', 0777)
            os.mkdir(path+'/'+str(user.id)+'/list/', 0777)
        twitterSessionObj = users_models.TwitterSession.objects.get(
            oauth_token=request_token['oauth_token'])
        twitterSessionObj.user_id = user.id
        twitterSessionObj.save()

        return user

    def get_user(self, user_id):
        try:
            return auth_models.User.objects.get(pk=user_id)
        except auth_models.User.DoesNotExist:
            return None


class SocialBackend:
    def authenticate(self, social_connect=None, oauth_verifier=None,
                     token=None, user=None):
        if social_connect == 'Twitter':
            consumer = oauth2.Consumer(settings.TWITTER_KEY, settings.TWITTER_SECRET)
            token = oauth2.Token(token['oauth_token'],
                                 token['oauth_token_secret'])
            token.set_verifier(oauth_verifier)
            client = oauth2.Client(consumer, token)
            resp, content = client.request(settings.TWITTER_ACCESS_URL, "POST")
            if resp['status'] != '200':
                return None
            access_token = dict(urlparse.parse_qsl(content))
            username = access_token['screen_name']
            uid = access_token['user_id']
            userExists = user_exists(user=user.id)

            if userExists:
                userProfile = users_models.Profile.objects.get(
                    user_id=user.id)
                userProfile.twitter_id = uid
                userProfile.twitter_username = username
                userProfile.social_session = 0
                userProfile.save()
            else:
                userProfile, created = users_models.Profile.objects.get_or_create(
                    twitter_id=uid, twitter_username=username, user_id=user.id)
                userProfile.save()


            twitterSessionObj = users_models.TwitterSession.objects.get(
                oauth_token=token['oauth_token'])
            twitterSessionObj.user_id = user.id
            twitterSessionObj.save()

        elif social_connect == 'Fb':
            facebook_session = users_models.FacebookSession.objects.get(
                access_token=token,)
            profile = facebook_session.query('me')
            userExists = user_exists(user=user.id)

            if userExists:
                userProfile = users_models.Profile.objects.get(
                    user_id=user.id,)
                userProfile.fb_id = profile['id']
                userProfile.fb_username = profile['username']
                userProfile.social_session = 1
                userProfile.save()

            else:
                userProfile, created = users_models.Profile.objects.get_or_create(
                    user_id=user.id, fb_username=profile['username'],
                    fb_id=profile['id'])
                userProfile.save()

            try:
                users_models.FacebookSession.objects.get(uid=profile['id']).delete()
            except users_models.FacebookSession.DoesNotExist, e:
                pass

            facebook_session.uid = profile['id']
            facebook_session.user = user
            facebook_session.save()
        return user

    def get_user(self, user_id):
        try:
            return auth_models.User.objects.get(pk=user_id)
        except auth_models.User.DoesNotExist:
            return None