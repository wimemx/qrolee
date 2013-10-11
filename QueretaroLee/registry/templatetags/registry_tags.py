#coding: utf8
from django import template

from account import models
from registry import models as rmodels
from django.contrib.auth import models as auth_models

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
    ret = 0
    feed = models.Activity.objects.get(
        id=feed_id)
    obj_list = list()
    obj_list.append(get_objects(feed.added_to_object, feed.added_to_type))
    obj_list.append(get_objects(feed.object, feed.type))
    img_url = '/static/media/users/'+str(feed.user_id)+'/'
    added_to_img_url = '/static/media/users/'+str(feed.user_id)+'/'

    if feed.added_to_type == 'U':
        profile = rmodels.Profile.objects.get(
            user_id=feed.user_id)
        if profile.picture == None:
            img_url = '/static/img/create.png'
        else:
            img_url += 'profile/'+profile.picture
        if obj_list[0].first_name != '':
            name = obj_list[0].first_name + ' '+ obj_list[0].last_name
        else:
            name = obj_list[0].username
    else:
        if obj_list[0].picture != '':
            img_url += 'entity/'+obj_list[0].picture
        else:
            img_url = '/static/img/create.png'
        name = obj_list[0].name

    if feed.type == 'U':
        if profile.picture == None:
            added_to_img_url = '/static/img/create.png'
        else:
            added_to_img_url += 'profile/'+profile.picture
        if obj_list[1].first_name != '':
            obj_name = obj_list[1].first_name + ' '+ obj_list[1].last_name
        else:
            obj_name = obj_list[1].username
    elif feed.type == 'D':
        if obj_list[1].picture != '':
            added_to_img_url += 'event/'+obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].name
        content_ = obj_list[1].location_name.split('#')
        content = content_[0]+' '
        content += content_[1]
        date = obj_list[1].start_time
        extra_content = str(date.hour).zfill(2)+':'+str(date.minute).zfill(2)+':00'
    elif feed.type == 'E':
        if obj_list[1].picture != '':
            added_to_img_url += 'entity/'+obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].name
        content = obj_list[1].description[:100]
        extra_content = ''
    date = member_since(feed.date)
    if feed.activity_id == 1:
        if feed.type == 'D':
            action = u'creó un evento'
        elif feed.type == 'E':
            if obj_list[1].type_id == 1:
                action = u'creó un grupo'
            else:
                action = u'creó una organización'
        else:
            action = ''
        ret_value = u"""<span class="create feed">
                            <span class="wrapper fleft">
                                <img src="{2}" alt=""/>
                            </span>
                            <span class="grid-6 content no-margin fleft">
                                    <span class="trigger din-b">{0} </span>
                                    <span class="verb din-r">{7} </span>
                                    <span class="verb din-b">{1} </span>
                                <span class="action grid-5 no-margin">
                                    <span class="wrapper fleft">
                                        <img src="{3}" alt=""/>
                                    </span>
                                    <span class="wrap fleft">
                                        <span class="din-m fleft">{1}</span>
                                    <p class="gray_text no-margin fleft">
                                        <span class="entry">{4}</span>
                                        <span class="time">{5}</span></p>
                                    </span>
                                    <p style="margin-top:10px;" class="gray_text no-margin fleft">hace {6}</p>
                                </span>
                            </span>

                        </span>"""
        ret = ret_value.format(
            name, obj_name, img_url, added_to_img_url,
            content, extra_content, date, action)

    elif feed.activity_id == 5:

        url = '/static/media/users/'+str(obj_list[0].id)+'/profile/'+str(profile.picture)
        ret = '<span class="follow feed">' \
              '<span class="wrapper fleft">' \
              '<img src="'+str(url)+'" alt=""/></span>' \
              '<span class="grid-6 content no-margin fleft">' \
              '<span class="trigger din-b">'+str(name)+' </span>' \
              '<span class="verb din-r">empezó a seguir a </span>' \
              '<span class="verb din-b">'+str(obj_name)+' </span></span>' \
              '<p class="gray_text no-margin fleft">hace '+str(date)+' </p></span>'


    return ret

def get_objects(object, type):
    if type == 'E':
        obj = rmodels.Entity.objects.get(
            id=object)
    elif type == 'D':
        obj = rmodels.Event.objects.get(
            id=object)
    elif type == 'A':
        obj = models.Author.objects.get(
            id=object)
    elif type == 'L':
        obj = models.List.objects.get(
            id=object)
    elif type == 'T':
        obj = models.Title.objects.get(
            id=object)
    elif type == 'U':
        obj = auth_models.User.objects.get(
            id=object)
    else:
        obj = None
    return obj