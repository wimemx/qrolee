from django.contrib import admin
from django import forms


from registry import models
from account import models as account


# Attribute Model
class AttributeModelForm(forms.ModelForm):
    description = forms.CharField(widget=forms.Textarea)
    meta_value = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = models.Attribute

class AttributeAdmin(admin.ModelAdmin):
    form = AttributeModelForm

# Attribute Type Model
class AttributeTypeModelForm(forms.ModelForm):
    description = forms.CharField(widget=forms.Textarea)


    class Meta:
        model = models.AttributeType

class AttributeTypeAdmin(admin.ModelAdmin):
    form = AttributeTypeModelForm

# Type Model
class TypeModelForm(forms.ModelForm):
    description = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = models.Type

class TypeAdmin(admin.ModelAdmin):
    form = TypeModelForm

# Entity Model
class EntityModelForm(forms.ModelForm):
    description = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = models.Entity


class EntityAdmin(admin.ModelAdmin):
    list_display = ['name', 'type']

    list_filter = ['type']


class Event(admin.ModelAdmin):

    list_display = ['name', 'location']

    list_filter = ['location']


class EntityUser(admin.ModelAdmin):

    list_display = ['entity', 'user']

    list_filter = ['is_admin', 'is_member']

admin.site.register(models.Type, TypeAdmin)
admin.site.register(models.AttributeType, AttributeTypeAdmin)
admin.site.register(models.Attribute, AttributeAdmin)
admin.site.register(models.Entity, EntityAdmin)
admin.site.register(models.Event, Event)
admin.site.register(models.Category)
admin.site.register(models.Profile)
admin.site.register(account.Author)
admin.site.register(account.ListTitle)
admin.site.register(account.List)
admin.site.register(account.Rate)
admin.site.register(account.Genre)
admin.site.register(account.GenreTitle)
admin.site.register(account.Title)
admin.site.register(account.ListGenre)
admin.site.register(account.ListAuthor)
admin.site.register(account.AuthorTitle)
admin.site.register(account.Activity)
admin.site.register(models.EntityUser)
admin.site.register(account.Page)
admin.site.register(account.ActivitiesList)