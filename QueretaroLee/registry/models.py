from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Cities(models.Model):
    code = models.CharField(max_length=4)
    city = models.CharField(max_length=128)
    accentCity = models.CharField(max_length=128)
    region = models.CharField(max_length=128)
    population = models.CharField(max_length=128)
    lat = models.CharField(max_length=128)
    long = models.CharField(max_length=128)


class Countries(models.Model):
    code = models.CharField(max_length=4)
    name = models.CharField(max_length=128)


class States(models.Model):
    code = models.CharField(max_length=4)
    region = models.CharField(max_length=4)
    name = models.CharField(max_length=128)


class Profile(models.Model):
    picture = models.CharField(max_length=255)
    phone = models.CharField(max_length=60, null=True)
    twitter_id = models.CharField(max_length=255, null=True)
    twitter_username = models.CharField(max_length=255, null=True)
    fb_username = models.CharField(max_length=255, null=True)
    fb_id = models.CharField(max_length=255, null=True)
    birthday = models.DateTimeField(null=True)
    status = models.BooleanField(default=True)
    city = models.CharField(max_length=100, null=True)
    postal_code = models.IntegerField(max_length=5, null=True)
    biography = models.CharField(max_length=255, null=True)
    website = models.CharField(max_length=255, null=True)
    is_new = models.BooleanField(default=True)
    social_session = models.BooleanField()
    social_session_twitter = models.BooleanField()
    user = models.ForeignKey(User)

    def __unicode__(self):
        return '%s, %s' % (self.user.first_name, self.city)


class AttributeType(models.Model):
    meta_key = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return '%s' % (self.meta_key, )


class Type(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return '%s' % (self.name, )


class Attribute(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    meta_value = models.CharField(max_length=255)
    type = models.ForeignKey(Type)
    attribute_type = models.ForeignKey(AttributeType)

    def __unicode__(self):
        return '%s' % (self.name, )


class Category(models.Model):
    name = models.CharField(max_length=255)
    type = models.ForeignKey(Type)

    def __unicode__(self):
        return '%s' % (self.name, )


class Entity(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    picture = models.CharField(max_length=255, null=True)
    cover_picture = models.CharField(max_length=255, null=True)
    date = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=255, null=True)
    privacy = models.BooleanField()
    fb = models.CharField(max_length=255, null=True)
    twitter = models.CharField(max_length=255, null=True)
    lat = models.CharField(max_length=255, null=True)
    long = models.CharField(max_length=255, null=True)
    website = models.CharField(max_length=255, null=True)
    fb_id = models.CharField(max_length=255, null=True)
    share_fb = models.BooleanField(default=False)
    share_twitter = models.BooleanField(default=False)
    user = models.ForeignKey(User)
    type = models.ForeignKey(Type)
    status = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s' % (self.name, )


class EntityCategory(models.Model):
    category = models.ForeignKey(Category)
    entity = models.ForeignKey(Entity)


class Event(models.Model):
    name = models.CharField(max_length=255)
    picture = models.CharField(max_length=255, null=True)
    cover_picture = models.CharField(max_length=255, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.TextField(null=True)
    location = models.CharField(max_length=255)
    location_name = models.CharField(max_length=255)
    place_spot = models.BooleanField(default=False)
    lat = models.CharField(max_length=255, null=True)
    long = models.CharField(max_length=255, null=True)
    privacy_type = models.BooleanField(default=False)
    status = models.BooleanField(default=True)
    share_fb = models.BooleanField(default=False)
    fb_id = models.CharField(max_length=45)
    location = models.ForeignKey(Entity)
    owner = models.ForeignKey(User)

    fb_url = models.CharField(max_length=255, null=True)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.description)


class AssistEvent(models.Model):
    event = models.ForeignKey(Event)
    user = models.ForeignKey(User)
    is_attending = models.BooleanField(default=False)


class Book(models.Model):
    code = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255)
    series = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    edition = models.CharField(max_length=255)
    published_date = models.DateTimeField()
    pages = models.CharField(max_length=255)
    isbn = models.CharField(max_length=255)
    isbn13 = models.CharField(max_length=255)
    language = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    cover = models.CharField(max_length=255)
    picture = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)
    author = models.CharField(max_length=255)
    genre = models.CharField(max_length=255)
    user = models.ForeignKey(User)

    def __unicode__(self):
        return '%s, %s' % (self.title, self.subtitle)


class Travel(models.Model):
    type_user = models.CharField(max_length=255)
    lat = models.CharField(max_length=255, null=True)
    long = models.CharField(max_length=255, null=True)
    status = models.BooleanField()
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(max_length=255)
    meta = models.TextField(max_length=255)
    user = models.IntegerField(max_length=10)
    is_new = models.BooleanField()
    address = models.CharField(max_length=255)
    book = models.ForeignKey(Book)

    def __unicode__(self):
        return '%s, %s' % (self.book, self.user)


class Course(models.Model):
    name = models.CharField(max_length=255)
    published = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=255)
    type_id = models.IntegerField(max_length=5)
    status = models.BooleanField()

    def __unicode__(self):
        return '%s, %s' % (self.name, self.published)


class Module(models.Model):
    name = models.CharField(max_length=255)
    text =  models.TextField(max_length=2000)
    order = models.IntegerField(max_length=5)
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField()
    course = models.ForeignKey(Course)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.order)

class Content(models.Model):
    name = models.CharField(max_length=255)
    text =  models.TextField(max_length=2000)
    order = models.IntegerField(max_length=5)
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField()
    module = models.ForeignKey(Module)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.order)


class Test(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=2000)
    available = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    meta = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.meta)

class Inscription(models.Model):
    course = models.ForeignKey(Course)
    user = models.ForeignKey(User)

    def __unicode__(self):
        return '%s, %s' % (self.course, self.user)


class Question(models.Model):
    title = models.CharField(max_length=255)
    meta = models.CharField(max_length=255, null=True)
    date = models.DateTimeField(auto_now_add=True)
    order = models.IntegerField(max_length=5)
    type = models.IntegerField(max_length=5)
    parent_id = models.IntegerField(max_length=5, null=True)

    def __unicode__(self):
        return '%s, %s' % (self.title, self.order)


class Question_Type(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=2000)
    help_text = models.CharField(max_length=255)
    meta = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.help_text)


class Answer(models.Model):
    value = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    order = models.IntegerField(max_length=5)
    question = models.ForeignKey(Question)

    def __unicode__(self):
        return '%s, %s' % (self.value, self.order)

class Option(models.Model):
    label = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    order = models.IntegerField(max_length=5)
    meta = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    question = models.ForeignKey(Question)

    def __unicode__(self):
        return '%s, %s' % (self.label, self.question)


class MemberToObject(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=0)
    is_member = models.BooleanField(default=0)
    super_user = models.BooleanField(default=0)
    request = models.BooleanField(default=0)
    object = models.IntegerField()
    object_type = models.CharField(max_length=1)
    user = models.ForeignKey(User)


class ExternalUser(models.Model):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    status = models.BooleanField(default=1)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.email)


class FacebookSessionError(Exception):
    def __init__(self, error_type, message):
        self.message = message
        self.type = type

    def get_message(self):
        return self.message

    def get_type(self):
        return self.type

    def __unicode__(self):
        return u'%s: "%s"' % (self.type, self.message)


class FacebookSession(models.Model):
    access_token = models.CharField(max_length=255, unique=True)
    expires = models.IntegerField(null=True)

    user = models.ForeignKey(User, null=True)
    uid = models.BigIntegerField(null=True)

    class Meta:
        unique_together = (('user', 'uid', 'access_token', 'expires'))

    def query(self, object_id, connection_type=None, metadata=False):
        import urllib
        import json
        url = 'https://graph.facebook.com/%s' % object_id
        if connection_type:
            url += '%s' % (connection_type)

        params = {'access_token': self.access_token}
        if metadata:
            params['metadata'] = 1

        url += '?' + urllib.urlencode(params)
        response = json.load(urllib.urlopen(url))
        if 'error' in response:
            error = response['error']
            raise FacebookSessionError(error['type'], error['message'])
        return response


class TwitterSession(models.Model):
    request_token = models.CharField(max_length=255)
    oauth_token = models.CharField(max_length=255)
    user = models.ForeignKey(User, null=True)

    class Meta:
        unique_together = (('request_token', 'oauth_token'),)

    def __unicode__(self):
        return self.oauth_token