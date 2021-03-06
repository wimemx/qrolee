# -*- coding: utf-8 -*-
from django import template

from account import models
from registry import models as rmodels
from registry import views
from django.contrib.auth import models as auth_models
from django.db import models as db_model

import datetime

register = template.Library()

@register.filter
def member_since(date):
    date_now = datetime.datetime.now()
    if (date_now.year - date.year) > 0:
        ext = ' años'
        if (date_now.year - date.year) == 1:
            ext = ' año'
        return 'hace '+str(date_now.year - date.year) + ext
    elif (date_now.month - date.month) > 0:
        ext = ' meses'
        if (date_now.month - date.month) == 1:
            ext = ' mes'
        if (date_now.month - date.month) == 12:
            return '1 año'
        return 'hace '+str(date_now.month - date.month) + ext
    else:
        ext = ' dias'
        if (date_now.day - date.day) == 1:
            ext = ' dia'
        if (date_now.day - date.day) <= 0:
            return ' hoy'
        if (date_now.day - date.day) == 30:
            return 'hace 1 mes'
        return 'hace '+str(date_now.day - date.day) + ext


@register.filter
def total_members(followers):
    return len(followers)


@register.filter
def get_num_followers(entity):
    followers = rmodels.MemberToObject.objects.filter(
        object_type='E', is_member=True, object=entity.id)
    len_ = len(followers)
    return len_


@register.filter
def get_num_comments(id):
    comments = models.Discussion.objects.filter(
        parent_discussion_id=id, status=True)
    len_ = len(comments)
    return len_


@register.filter
def feed_type(feed_id, user):
    feed = models.Activity.objects.get(
        id=feed_id)
    obj_list = list()
    added_to = get_objects(feed.added_to_object, feed.added_to_type)
    obj = get_objects(feed.object, feed.type)
    if added_to is None:
        return ''
    if obj is None:
        return ''

    if user != -1:
        if feed.added_to_type == 'E':
            membership = rmodels.MemberToObject.objects.filter(
                object=added_to.id, user_id=user.id, object_type='E', is_member=True)
            if not membership:
                return ''
        if feed.added_to_type == 'U':
            membership = rmodels.MemberToObject.objects.filter(
                object=obj.id, user_id=user.id, object_type='E', is_member=True)
            if not membership:
                return ''

    obj_list.append(added_to)
    obj_list.append(obj)
    img_url = '/static/media/users/'+str(feed.user_id)+'/'
    added_to_img_url = '/static/media/users/'+str(feed.user_id)+'/'
    name = ''
    obj_name = ''
    trigger_url = ''
    whom_url = ''
    if feed.added_to_type == 'U':
        profile = rmodels.Profile.objects.get(
            user_id=feed.user_id)

        if not profile.picture:
            img_url = '/static/img/no_profile.png'
        elif profile.picture.strip() == '':
            img_url = '/static/img/no_profile.png'
        else:
            img_url += 'profile/'+profile.picture

        if obj_list[0].first_name != '':
            name = obj_list[0].first_name + ' '+obj_list[0].last_name
        else:
            name = obj_list[0].username
        trigger_url = '/accounts/users/profile/'+str(obj_list[0].id)

    elif feed.added_to_type == 'L':
        user = auth_models.User.objects.get(
            id=obj_list[0].user_id)
        profile = rmodels.Profile.objects.get(
            user_id=user.id)
        if not profile.picture:
            img_url = '/static/img/no_profile.png'
        elif profile.picture.strip() == '':
            img_url = '/static/img/no_profile.png'
        else:
            img_url += 'profile/'+profile.picture

        if user.first_name != '':
            name = user.first_name + ' '+user.last_name
        else:
            name = user.username
        trigger_url = '/accounts/users/profile/'+str(user.id)
    elif feed.added_to_type == 'E':
        if obj_list[0].picture != '':
            img_url += 'entity/'+obj_list[0].picture
        else:
            img_url = '/static/img/create.png'
        name = obj_list[0].name
        trigger_url = '/qro_lee/entity/'+obj_list[0].type.name+'/'+str(obj_list[0].id)
    else:
        if obj_list[0].picture != '':
            img_url += 'entity/'+obj_list[0].picture
        else:
            img_url = '/static/img/create.png'
        name = obj_list[0].name

    if feed.type == 'U':
        profile = rmodels.Profile.objects.get(
            user_id=obj_list[1].id)
        if not profile.picture:
            added_to_img_url = '/static/img/no_profile.png'
        elif profile.picture.strip() == '':
            added_to_img_url = '/static/img/no_profile.png'
        else:
            added_to_img_url += 'profile/'+profile.picture
        if obj_list[1].first_name != '':
            obj_name = obj_list[1].first_name + ' '+obj_list[1].last_name
        else:
            obj_name = obj_list[1].username
        whom_url = '/accounts/users/profile/'+str(obj_list[1].id)
    elif feed.type == 'D':
        if obj_list[1].picture != '':
            added_to_img_url += 'event/'+obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].name
        content_ = obj_list[1].location_name.split('#')
        content = content_[0]+' '
        if len(content_) > 1:
            content += content_[1]
        date = obj_list[1].start_time

        extra_content = str(date.hour).zfill(2)+':'+str(date.minute).zfill(2)+':00'
        whom_url = '/qro_lee/events/'+str(obj_list[1].id)
    elif feed.type == 'E':
        if obj_list[1].picture != '':
            added_to_img_url += 'entity/'+obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].name
        content = obj_list[1].description[:100]
        extra_content = ''
        whom_url = '/qro_lee/entity/organization/'+str(obj_list[1].id)
    elif feed.type == 'T':
        if obj_list[1].picture != '':
            added_to_img_url = obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].title
        content = ''
        extra_content = ''
        whom_url = '/qro_lee/profile/title/'+str(obj_list[1].id)

    elif feed.type == 'A':
        if obj_list[1].picture != '':
            added_to_img_url = obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].name
        content = ''
        extra_content = ''
        whom_url = '/qro_lee/profile/author/'+str(obj_list[1].id)
    elif feed.type == 'L':
        if not obj_list[1].picture:
            obj_list[1].picture = ''
        if obj_list[1].picture != '':
            added_to_img_url = '/static/media/users/'+str(obj_list[1].user.id)+'/list/'+obj_list[1].picture
        else:
            added_to_img_url = '/static/img/create.png'
        obj_name = obj_list[1].name
        content = ''
        extra_content = ''
        whom_url = '/qro_lee/profile/list/'+str(obj_list[1].id)
    date = member_since(feed.date)

    if feed.activity_id == 1:
        if feed.type == 'D':
            action = u'creó un evento'
        elif feed.type == 'E':
            if obj_list[1].type_id == 1:
                action = u'creó un grupo'
            elif obj_list[1].type_id == 2:
                action = u'creó una organización'
            elif obj_list[1].type_id == 3:
                action = u'creó un spot'
            else:
                action = u'realizo un rating'
        elif feed.type == 'L':
            action = u'creó una lista'
        elif feed.type == 'T':
            action = u'añadio a'
        else:
            action = ''
        ret_value = u"""<span class="create feed">
                            <a href="{8}" class="wrapper fleft">
                                <img src="{2}" alt=""/>
                            </a>
                            <span class="grid-7 content no-margin fleft">
                                    <span class="trigger din-b"><a href="{8}">{0}</a> </span>
                                    <span class="verb din-r">{7} </span>
                                    <span class="verb din-b"><a href="{9}">{1}</a> </span>
                                <span class="action grid-5 no-margin">
                                    <a href="{9}" class="wrapper fleft">
                                        <img src="{3}" alt=""/>
                                    </a>
                                    <span class="wrap fleft">
                                        <span class="din-m fleft"><a href="{9}">{1}</a></span>
                                    <p class="gray_text no-margin fleft">
                                        <span class="entry">{4}</span>
                                        <span class="time">{5}</span></p>
                                    </span>
                                    <p style="margin-top:10px;" class="gray_text no-margin fleft"> {6}</p>
                                </span>
                            </span>

                        </span>"""
        ret = ret_value.format(
            name, obj_name, img_url, added_to_img_url,
            content, extra_content, date, action, trigger_url, whom_url)

    elif feed.activity_id == 4:
        action = u'añadio a'
        list_ = models.List.objects.get(
            id=int(feed.added_to_object))
        list_url = '/qro_lee/profile/list/'+str(list_.id)
        ret_value = u"""<span class="create feed">
                            <a href="{8}" class="wrapper fleft">
                                <img src="{2}" alt=""/>
                            </a>
                            <span class="grid-7 content no-margin fleft">
                                    <span class="trigger din-b"><a href="{8}">{0}</a> </span>
                                    <span class="verb din-r">{7} </span>
                                    <span class="verb din-b"><a href="{11}">{10}</a> </span>
                                <span class="action grid-5 no-margin">
                                    <a href="{9}" class="wrapper fleft">
                                        <img src="{3}" alt=""/>
                                    </a>
                                    <span class="wrap fleft">
                                        <span class="din-m fleft"><a href="{9}">{1}</a></span>
                                    <p class="gray_text no-margin fleft">
                                        <span class="entry">{4}</span>
                                        <span class="time">{5}</span></p>
                                    </span>
                                    <p style="margin-top:10px;" class="gray_text no-margin fleft"> {6}</p>
                                </span>
                            </span>

                        </span>"""
        ret = ret_value.format(
            name, obj_name, img_url, added_to_img_url,
            content, extra_content, date, action,
            trigger_url, whom_url, list_.name, list_url)

    elif feed.activity_id == 5:
        if feed.type == 'E':
            if obj_list[1].type_id == 1:
                action = u'se unió al grupo'
            else:
                action = u'empezó a seguir a'
        else:
            action = u'empezó a seguir a'
        ret_value = u"""<span class="follow feed">
              <a href="{5}" class="wrapper fleft">
                <img src="{2}" alt=""/>
              </a>
              <span class="grid-7 content no-margin fleft">
              <span class="trigger din-b"><a href="{5}">{0}</a> </span>
              <span class="verb din-r">{4} </span>
              <span class="verb din-b"><a href="{6}">{1}</a> </span></span>
              <p class="gray_text no-margin fleft"> {3}</p></span>"""
        ret = ret_value.format(
            name, obj_name, img_url, date,
            action, trigger_url, whom_url)

    elif feed.activity_id == 6:
        action = u'calificó a'

        rate_ = models.Rate.objects.filter(type=str(feed.type), element_id=feed.object).values(
            'element_id').annotate(count=db_model.Count('element_id'), score=db_model.Avg('grade'))
        grade = rate_[0]['score']
        if str(feed.type) == 'E':
            u_id = auth_models.User.objects.get(entity__id=int(obj_list[1].id))
            if obj_list[1].picture != '':
                added_to_img_url = '/static/media/users/'+str(u_id.id)+'/entity/'+obj_list[1].picture
        rating = ''
        for i in range(1, 6):
            if i <= grade:
                rating += '<span class="rated"></span>'
            else:
                rating += '<span class="unrated"></span>'
        ret_value = u"""<span class="create feed">
                            <a href="{7}" class="wrapper fleft">
                                <img src="{2}" alt=""/>
                            </a>
                            <span class="grid-7 content no-margin fleft">
                                    <span class="trigger din-b"><a href="{7}">{0}</a> </span>
                                    <span class="verb din-r">{4} </span>
                                    <span class="verb din-b"><a href="{8}">{1}</a> </span>
                                <span class="action grid-5 no-margin">
                                    <a href="{8}" class="wrapper fleft">
                                        <img src="{5}" alt=""/>
                                    </a>
                                    <span class="wrap fleft">
                                        <span class="din-m fleft"><a href="{8}">{1}</a> </span>
                                    <p class="gray_text no-margin fleft">
                                        <span style="margin-top:5px;display:block;" class="entry">{6}</span>
                                        <span class="time"></span></p>
                                    </span>
                                    <p style="margin-top:10px;" class="gray_text no-margin fleft"> {3}</p>
                                </span>
                            </span>

                        </span>"""
        ret = ret_value.format(
            name, obj_name, img_url, date,
            action, added_to_img_url, rating, trigger_url, whom_url)
    else:
        ret = ''
    return ret


def get_objects(object, type):
    if type == 'E':
        obj = rmodels.Entity.objects.filter(
            id=object, status=True)
        if obj:
            obj = obj[0]
        else:
            obj = None
    elif type == 'D':
        obj = rmodels.Event.objects.filter(
            id=object, status=True)
        if obj:
            obj = obj[0]
        else:
            obj = None
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
        obj = auth_models.User.objects.filter(
            id=object, is_active=True)
        if obj:
            obj = obj[0]
        else:
            obj = None
    else:
        obj = None

    return obj


@register.filter
def img_autoescape(text):
    t = str(text)
    img = t.split('<img')
    src_img = ''
    if len(img) > 1:
        src = img[1].split('src="')
        if len(src) > 0:
            end = str(src[1]).find('"')
            src_img = str(src[1])[0:end]

    return src_img


@register.filter
def replace(text, char):

    text = text.replace('#', ' ')

    return text


@register.filter
def fsocial_session(user):
    user = auth_models.User.objects.filter(
        id=user.id)
    if not user:
        return False
    profile = rmodels.Profile.objects.get(
        user_id=user)
    if profile.social_session == 1:
        return True
    else:
        return False


@register.filter
def split(text, char):
    s_split = str(text)
    s_split = s_split.split(str(char))
    return s_split


@register.filter
def new_user(user):
    profile = rmodels.Profile.objects.get(
        user_id=user.id)
    return profile.is_new


@register.filter
def time_tag(time):
    time_str = ''
    if str(time.hour) == '0':
        time_str += '0'+str(time.hour)
    else:
        time_str += str(time.hour)
    if str(time.minute) == '0':
        time_str += ':0'+str(time.minute)
    else:
        time_str += ':'+str(time.minute)

    return time_str


@register.filter
def date_tag(date):
    return str(date.month)+'/'+str(date.day)+'/'+str(date.year)


@register.filter
def is_auth(user):
    if user.is_authenticated():
        return True
    else:
        return False


@register.filter
def cut_word(text, index):

    word = text
    if len(text) > 30:
        word = text[0:30] + ' ' + text[30:len(text)]
    return word


@register.filter
def times(number):
    return range(number)

@register.filter
def sum(arg_a, arg_b):

    total = arg_a + arg_b

    return total