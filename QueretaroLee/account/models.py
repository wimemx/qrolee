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
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s, %s' % (self.title, self.type)


class Author(models.Model):
    name = models.CharField(max_length=255)
    birthday = models.DateTimeField()
    picture = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s' % (self.name)


class AuthorTitle(models.Model):
    title = models.ForeignKey(Title)
    author = models.ForeignKey(Author)

    def __unicode__(self):
        return '%s, %s' % (self.title.title, self.author.first_name)


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
    picture = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s, %s' % (self.list.name, self.author.first_name)

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

#class ListUser(models.Model):
#    user = models.ForeignKey(User)
#    list = models.ForeignKey(List)

class Rate(models.Model):
    type = models.CharField(max_length=1)
    grade = models.FloatField()
    element_id = models.IntegerField(max_length=3)
    user = models.ForeignKey(User)


class Activity(models.Model):
    user = models.ForeignKey(User)
    object = models.IntegerField(primary_key=True)
    verb = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    meta = models.TextField()
    type = models.CharField(max_length=1)


