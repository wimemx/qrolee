#coding: utf8
from django import template

import datetime

register = template.Library()

@register.filter
def member_since(date):
    date_now = datetime.datetime.now()
    print date_now.year
    print date.year
    print
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
