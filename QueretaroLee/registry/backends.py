from django.contrib.auth import models as auth_models
from django.contrib.auth.models import User

from registry import models as users_models, settings
from account import models as account
from registry import views as registry_view
import oauth2
import urlparse
import os

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
            user_profile.save()
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
            path = os.path.join(os.path.dirname(__file__), '..', 'static/media/users').replace('\\','/')
            os.mkdir(path+'/'+str(user.id), 0777)
            os.mkdir(path+'/'+str(user.id)+'/profile', 0777)
            os.mkdir(path+'/'+str(user.id)+'/entity', 0777)
            os.mkdir(path+'/'+str(user.id)+'/event', 0777)
            os.mkdir(path+'/'+str(user.id)+'/list/', 0777)

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
        username = access_token['screen_name']
        uid = access_token['user_id']
        userExists = user_exists(username=username)

        if userExists:
            user = auth_models.User.objects.get(username=username)
        else:
            user, created = auth_models.User.objects.get_or_create(
                username=username,
            )
            user.set_unusable_password()
            user.save()
            user_profile = users_models.Profile.objects.create(user_id=user.id)
            user_profile.twitter_username = access_token['screen_name']
            user_profile.twitter_id = access_token['user_id']
            user_profile.save()
            registry_view.create_default_list(user);
            path = os.path.join(os.path.dirname(__file__), '..', 'static/media/users').replace('\\','/')
            os.mkdir(path+'/'+str(user.id), 0777)
            os.mkdir(path+'/'+str(user.id)+'/profile', 0777)
            os.mkdir(path+'/'+str(user.id)+'/entity', 0777)
            os.mkdir(path+'/'+str(user.id)+'/event', 0777)

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