from django.db import models
from django.contrib.auth.models import User
from registry import models as registry_models

# Create your models here.


class Title(models.Model):
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
    type = models.CharField(max_length=255)
    cover = models.CharField(max_length=255)
    picture = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)
    id_google = models.TextField(max_length=30)
    description = models.TextField()

    def __unicode__(self):
        return '%s, %s' % (self.title, self.type)


class Author(models.Model):
    name = models.CharField(max_length=255)
    birthday = models.DateTimeField()
    picture = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    biography = models.CharField(max_length=1000)
    status = models.BooleanField(default=True)
    id_api = models.TextField()

    def __unicode__(self):
        return '%s' % (self.name)


class Genre(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.status)

class GenreTitle(models.Model):
    title = models.ForeignKey(Title)
    genre = models.ForeignKey(Genre)

    def __unicode__(self):
        return '%s, %s' % (self.title.title, self.genre.name)

class List(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)
    type = models.CharField(max_length=1)
    privacy = models.BooleanField(default=False)
    picture = models.CharField(max_length=255)
    default_type = models.IntegerField()
    user = models.ForeignKey(User)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.user.first_name)

class ListAuthor(models.Model):
    list = models.ForeignKey(List)
    author = models.ForeignKey(Author)

    def __unicode__(self):
        return '%s, %s' % (self.list.name, self.author.name)

class ListGenre(models.Model):
    list = models.ForeignKey(List)
    genre = models.ForeignKey(Genre)
    status = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s, %s' % (self.list.name, self.genre.name)


class ListTitle(models.Model):
    title = models.ForeignKey(Title)
    list = models.ForeignKey(List)

    def __unicode__(self):
        return '%s, %s' % (self.title.title, self.list.name)


class AuthorTitle(models.Model):
    title = models.ForeignKey(Title)
    author = models.ForeignKey(Author)

    def __unicode__(self):
        return '%s, %s' % (self.title.title, self.author.name)

#class ListUser(models.Model):
#    user = models.ForeignKey(User)
#    list = models.ForeignKey(List)


class Rate(models.Model):
    type = models.CharField(max_length=1)
    grade = models.FloatField()
    element_id = models.IntegerField(max_length=3)
    user = models.ForeignKey(User)


class ActivitiesList(models.Model):
    name = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s' % (self.name)


class Activity(models.Model):
    user = models.ForeignKey(User)
    object = models.IntegerField(max_length=5)
    added_to_object = models.IntegerField(max_length=5, null=True)
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=1)
    added_to_type = models.CharField(max_length=1, null=True)
    activity = models.ForeignKey(ActivitiesList)


class Page(models.Model):
    name = models.CharField(max_length=100)
    coment = models.TextField(max_length=2000)
    tags = models.TextField(max_length=1000)
    date = models.DateTimeField()
    meta = models.TextField(max_length=1000)
    user = models.ForeignKey(User)
    status = models.BooleanField(default=True)
    
    
class Discussion(models.Model):
    name = models.CharField(max_length=255)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    meta = models.CharField(max_length=1)
    status = models.BooleanField(default=True)
    entity = models.ForeignKey(registry_models.Entity)
    user = models.ForeignKey(User)
    parent_discussion = models.ForeignKey('self', blank=True, null=True)

    def as_json(self):
        user_pic = registry_models.Profile.objects.get(user_id=self.user.id)
        return dict(id=self.id, name=self.name, content=self.content,
                    date=self.date.isoformat(), entity=self.entity.id, user=self.user.id,
                    username=self.user.username, parent_discussion=self.parent_discussion.id,
                    user_pic=user_pic.picture,)

    def parent_as_json(self):
        user_pic = registry_models.Profile.objects.get(user_id=self.user.id)
        return dict(id=self.id, name=self.name, content=self.content,
                    date=self.date.isoformat(), entity=self.entity.id, user=self.user.id,
                    username=self.user.username, user_pic=user_pic.picture,)