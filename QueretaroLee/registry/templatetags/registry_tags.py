#coding: utf8
from django import template

from account import models
from registry import models as rmodels

import datetime

register = template.Library()

@register.filter
def member_since(date):
    date_now = datetime.datetime.now()
    if (date_now.year - date.year) > 0:
        ext = ' años'
        if (date_now.year - date.year) == 1:
            ext = ' año'
        return str(date_now.year - date.year) + ext
    elif (date_now.month - date.month) > 0:
        ext = ' meses'
        if (date_now.month - date.month) == 1:
            ext = ' mes'
        return str(date_now.month - date.month) + ext
    else:
        ext = ' dias'
        if (date_now.day - date.day) == 1:
            ext = ' dia'
        return str(date_now.day - date.day) + ext

@register.filter
def total_members(followers):
    print followers
    return len(followers)

@register.filter
def feed_type(feed_id):
    feed = models.Activity.objects.get(
        id=feed_id)
    if feed.type == 'E':
        obj = rmodels.Entity.objects.get(
            id=feed.object)
    elif feed.type == 'D':
        obj = rmodels.Event.objects.get(
            id=feed.object)
    elif feed.type == 'A':
        obj = models.Author.objects.get(
            id=feed.object)
    elif feed.type == 'L':
        obj = models.List.objects.get(
            id=feed.object)
    elif feed.type == 'T':
        obj = models.Title.objects.get(
            id=feed.object)
    else:
        obj = None
    print obj
    return 0