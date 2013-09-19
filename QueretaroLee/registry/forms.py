from django import forms

from registry import models

class EntityForm(forms.Form):
    name = forms.CharField(max_length=255)
    description = forms.CharField(widget=forms.Textarea)
    picture = forms.CharField(max_length=255)
    # privacy = false = Public Entity
    privacy = forms.BooleanField()
    date = forms.DateTimeField()
    address = forms.CharField(max_length=255)
    lat = forms.CharField(max_length=255)
    long = forms.CharField(max_length=255)