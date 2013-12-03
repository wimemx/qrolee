from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Course(models.Model):
    name = models.CharField(max_length=255)
    published = models.BooleanField()
    date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=255)
    type_pk = models.IntegerField(max_length=5)
    description = models.TextField(max_length=2000,null=True)
    status = models.BooleanField(default=True)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.published)


class Module(models.Model):
    name = models.CharField(max_length=255)
    text = models.TextField(max_length=2000)
    order = models.IntegerField(max_length=5, default=0)
    date = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)
    course = models.ForeignKey(Course)

    def __unicode__(self):
        return '%s, %s' % (self.name, self.order)


class Content(models.Model):
    name = models.CharField(max_length=255)
    text = models.TextField(max_length=2000)
    order = models.IntegerField(max_length=5, default=0)
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
    module = models.ForeignKey(Module)

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
