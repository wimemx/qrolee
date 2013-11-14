# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models.loading import get_model
from django.db import models as db_model
from django.template.loader import get_template
from django.template import Context
from django.db.models import Q
from django.core import serializers

from registry.models import Entity, Type, Event
from account import models as account_models
from registry import models, views, settings


from decimal import Decimal
import simplejson
import calendar
import HTMLParser
import datetime
import ast
import operator
import math
import urllib2
import urllib
import httplib
import os
from xml.dom import minidom
import xhtml2pdf.pisa as pisa
import cStringIO as StringIO
import cgi


@login_required(login_url='/')
def index(request, **kwargs):
    template = kwargs['template_name']
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/')

    user = request.user
    profile = models.Profile.objects.get(user_id=user)

    following = account_models.Activity.objects.filter(
        user_id=user.id, activity_id=5, type='U').distinct()

    following_entity = account_models.Activity.objects.filter(
        user_id=user.id, activity_id=5, type='E').distinct()

    following_list = list()
    entity_following_list = list()
    for follow in following:
        following_list.append(follow.object)

    for f in following_entity:
        entity_following_list.append(f.object)

    following_list.append(user.id)

    activity = account_models.Activity.objects.filter(
        Q(user_id__in=following_list) |
        Q(added_to_object__in=entity_following_list, added_to_type='E')).order_by('-date')

    entities = models.Entity.objects.filter(
        user_id=user)
    groups = entities.filter(type__name='group')
    organizations = entities.filter(type__name='organization')
    pages = account_models.Page.objects.filter(user_id=user)
    events = models.Event.objects.filter(
        Q(owner_id=user) |
        Q(location_id__in=entity_following_list)).distinct()
    context = {
        'user': user,
        'profile': profile,
        'groups': groups,
        'organizations': organizations,
        'pages': pages,
        'events': events,
        'activity': activity
    }
    return render(request, template, context)


@login_required(login_url='/')
def get_entities(request, **kwargs):
    is_ajax_call = False
    status = True
    if 'csrfmiddlewaretoken' in request.POST:
        is_ajax_call = True

    template = kwargs['template_name']
    entity_type = kwargs['entity_type']
    if entity_type == 'all':
        entity_type_ids = models.Type.objects.all()
    else:
        entity_type_ids = models.Type.objects.filter(name=entity_type)

    entity_ids = list()
    user_ids = list()
    for ele in entity_type_ids:
        entity_ids.append(ele.id)

    entity = models.Entity.objects.filter(
        type_id__in=entity_ids, status=status)

    request_user_is_admin = list()
    for e in entity:
        admins = models.MemberToObject.objects.filter(
            object_type='E', object=e.id, is_admin=True)
        for a in admins:
            #print a.user_id
            if request.user.id == a.user_id:
                request_user_is_admin.append(e.id)
    user_entities = entity.filter(id__in=request_user_is_admin)
    entity = entity.exclude(id__in=request_user_is_admin)

    if request.POST.get('field_search_entity'):
        if request.POST['field_search_entity'] == '*':
            entity = models.Entity.objects.filter(
                type_id__in=entity_ids, status=status).exclude(user_id=request.user)
        else:
            search = request.POST['field_search_entity']
            entity = models.Entity.objects.filter(
                type_id__in=entity_ids, name__icontains=search, status=status)
            admins_list = list()
            entites_list = list()
            request_user_is_admin = list()
            for e in entity:
                admins = models.MemberToObject.objects.filter(
                    object_type='E', object=e.id, is_admin=True)
                for a in admins:
                    #print a.user_id
                    if request.user.id == a.user_id:
                        request_user_is_admin.append(e.id)
            user_entities = entity.filter(id__in=request_user_is_admin)
            entity = entity.exclude(id__in=request_user_is_admin)



    value = {}
    user_entities_value = {}
    fields_related_objects = models.Entity._meta.get_all_related_objects(
        local_only=True)
    fields = models.Entity._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = models.Entity._meta.get_all_field_names()
        fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    field_types = list()

    for field in fields:
        field_type = models.Entity._meta.get_field(field).get_internal_type()
        field_types.append(field_type)

    for obj in entity:
        context_fields = {
            'is_admin': 0
        }
        for data in fields:
            if isinstance(obj.__getattribute__(data), unicode):
                context_fields[str(data)] = obj.__getattribute__(data).encode('utf-8', 'ignore')
            else:
                field_value = str(obj.__getattribute__(str(data)))
                if str(data) == 'user':
                    field_value = str(obj.__getattribute__(str(data)).id)
                context_fields[str(data)] = field_value

        if obj.type.name == 'group':
            count = models.MemberToObject.objects.filter(object=obj.id, object_type='E', is_member=True).values('object').\
                annotate(count=db_model.Count('user'))
            context_fields['members'] = count[0]['count']

        if obj.type.name == 'spot':
            categorys = models.EntityCategory.objects.filter(entity__id=obj.id)
            tags = {}
            for tag in categorys:
                tags[tag.id] = {
                    'name': tag.category.name
                }
            context_fields['tags'] = tags

        value[obj.id] = context_fields

    for obj in user_entities:
        context_fields = {
            'is_admin': 1
        }
        for data in fields:
            if isinstance(obj.__getattribute__(data), unicode):
                context_fields[str(data)] = obj.__getattribute__(data).encode('utf-8', 'ignore')
            else:
                field_value = str(obj.__getattribute__(str(data)))
                if str(data) == 'user':
                    field_value = str(obj.__getattribute__(str(data)).id)
                context_fields[str(data)] = field_value

        if obj.type.name == 'group':
            count = models.MemberToObject.objects.filter(object=obj.id, object_type='E', is_member=True).values('object').\
                annotate(count=db_model.Count('user'))
            context_fields['members'] = count[0]['count']

        if obj.type.name == 'spot':
            categorys = models.EntityCategory.objects.filter(entity__id=obj.id)
            tags = {}
            for tag in categorys:
                tags[tag.id] = {
                    'name': tag.category.name
                }
            context_fields['tags'] = tags

        user_entities_value[obj.id] = context_fields

    if is_ajax_call:
        context = {
            str(entity_type): value,
            'user_entities': user_entities_value
        }
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')
    else:
        if entity_type == 'group':
            entity_type = ['grupos de lectura', 'group','grupo de lectura']
            content = 'A continuación se despliegan los grupos que forman parte de Querétaro Lee.'
        elif entity_type == 'spot':
            content = 'A continuación se despliegan los lugares en Querétaro ' \
                      'donde se pueden llevar a cabo actividades relacionadas con la lectura.'
            entity_type = ['lugares', 'spot','lugar']
        else:
            entity_type == 'organization'
            entity_type = ['organizaciones', 'organization','organización']
            content = 'A continuación se despliegan las organizaciones que forman' \
                  ' parte de Querétaro Lee. '

        for e in entity:
            e.address = e.address.split('#')
        for e in user_entities:
            e.address = e.address.split('#')
        entity = value
        user_entities = user_entities_value

        context = {
            'entities': entity,
            'entity_type': entity_type,
            'content': content,
            'user_entities': user_entities
        }

        if 'post' in request.POST:
            context = simplejson.dumps(context)
            return HttpResponse(context, mimetype='application/json')

        if entity_type[1] == 'spot':
            context['classspot'] = 'class=scrollspot';
            context['classimage'] = 'd-wrapperspot';

        return render(request, template, context)


@login_required(login_url='/')
def get_entity(request, **kwargs):
    template = kwargs['template_name']
    id_entity = int(kwargs['entity'])
    entity = models.Entity.objects.get(id=id_entity)
    categories = models.EntityCategory.objects.filter(
        entity_id=entity.id)
    rate = account_models.Rate.objects.filter(
        element_id=id_entity, type='E').values('element_id').annotate(
        count=db_model.Count('element_id'), score=db_model.Avg('grade'))
    my_rate = account_models.Rate.objects.filter(
        user=request.user, element_id=id_entity, type='E')

    request_sent = False
    if request.POST:
        activity_id = -1
        if 'membership' in request.POST:
            membership = int(request.POST.get('membership'))
            entityuser = models.MemberToObject.objects.get_or_create(
                user_id=request.user.id, object=entity.id, object_type='E')
            if membership == 1:
                activity_id = 5
                entityuser[0].is_member = True
                entityuser[0].save()
            else:
                activity_id = 10
                entityuser[0].is_member = False
                entityuser[0].is_admin = False
                entityuser[0].save()

        elif 'follow_private' in request.POST:
            membership = int(request.POST.get('follow_private'))
            entityuser = models.MemberToObject.objects.get_or_create(
                user_id=request.user.id, object=entity.id, object_type='E')
            if membership == 1:
                activity_id = 5
                request_sent = True
                entityuser[0].request = True
                entityuser[0].save()
            else:
                activity_id = 10
                entityuser[0].request = False
                entityuser[0].is_member = False
                entityuser[0].is_admin = False
                entityuser[0].save()
        activity_data = {
            'user_id': request.user.id,
            'object': entity.id,
            'added_to_object': request.user.id,
            'type': 'E',
            'added_to_type': 'U',
            'activity_id': activity_id
        }
        if activity_id != -1:
            views.update_activity(activity_data)
    else:
        entityuser = models.MemberToObject.objects.filter(
            user_id=request.user.id, object=entity.id, object_type='E')
        if entityuser:
            request_sent = entityuser[0].request


    categories_ids = list()
    for ele in categories:
        categories_ids.append(ele.category_id)
    entity_type = models.Type.objects.get(
        entity__id=entity.id)
    owner = models.User.objects.get(
        id=entity.user_id)
    profile = models.Profile.objects.get(
        user_id=owner.id)
    entities = models.Entity.objects.filter(
        type_id=entity_type.id,
        entitycategory__category_id__in=categories_ids, status=True).exclude(
            id=entity.id).distinct()
    followers_list = list()
    entity_followers = models.User.objects.filter(
        membertoobject__is_member=1, membertoobject__object=entity.id, membertoobject__object_type='E')
    user_pictures = list()
    for follower in entity_followers:
        profile = models.Profile.objects.get(
            user_id=follower.id)
        user_pictures.append(profile.picture)
    entity_admins = models.User.objects.filter(
        membertoobject__is_admin=1, membertoobject__object=entity.id,
        membertoobject__object_type='E')
    admins = User.objects.filter(id__in=entity_admins).distinct()

    for ent in entities:
        followers = models.MemberToObject.objects.filter(
            object=ent.id, object_type='E')
        followers_list.append(len(followers))

    count_vot = 0
    count_rate = 0
    my_vot = 0

    if len(rate) > 0:
        count_vot = rate[0]['count']
        count_rate = rate[0]['score']

    if len(my_rate) > 0:
        my_vot = my_rate[0].grade

    events = models.Event.objects.all()
    unescaped = load_calendar(events)

    if entity_type.name == 'group':
        entity_type = ['grupos de lectura', 'group', 'grupo']
    elif entity_type.name == 'organization':
        entity_type = ['organizaciones', 'organization', 'organización']
    elif entity_type.name == 'spot':
        entity_type = ['lugares', 'spot']

    if not entityuser:
        member = False
    else:
        member = entityuser[0].is_member

    entity.address = entity.address.split('#')
    activity = account_models.Activity.objects.filter(
        added_to_object=entity.id, added_to_type='E').order_by('-date')

    discussions = account_models.Discussion.objects.filter(
        entity__id=entity.id, parent_discussion_id=None).order_by('-date')
    context = {
        'entity': entity,
        'calendar': unescaped,
        'entity_type': entity_type,
        'owner': owner,
        'profile': profile,
        'similar_entities': zip(entities, followers_list),
        'member': member,
        'my_grade': len(my_rate),
        'count_rate': count_rate,
        'my_vot': my_vot,
        'range': range(5),
        'count_vot': count_vot,
        'followers': zip(entity_followers, user_pictures),
        'admins': admins,
        'activity': activity,
        'discussions': discussions,
        'request_sent': request_sent
    }

    return render(request, template, context)


def get_events(request, **kwargs):
    status = True
    entity = kwargs['entity_id']
    if int(entity) > 0 or int(request.POST.get('curr_month')) == -1:
        if int(entity) != -1:
            events_ = models.Event.objects.filter(
                location_id=int(entity), status=status)
        else:
            events_ = models.Event.objects.filter(status=status)
            if request.POST.get('id_entity') is not None:
                if int(request.POST['id_entity']) != -1:
                    events_ = models.Event.objects.filter(
                        location_id=request.POST['id_entity'], status=status)

        events = []
        for event in events_:
            # Event date = Month, day, id
            event_date = list()
            event_date.append(event.start_time.month)
            event_date.append(event.start_time.day)
            event_date.append(int(event.id))
            event_date.append(event.start_time.year)
            events.append(event_date)

    if int(request.POST.get('curr_month')) != -1:
        if int(entity) != -1:
            events_ = models.Event.objects.filter(
                start_time__month=int(request.POST.get('curr_month'))+1,
                location_id=int(entity), status=status).order_by('start_time')
        else:
            if int(request.POST.get('id_entity')) != -1:
                admins = models.MemberToObject.objects.filter(
                    object=int(request.POST.get('id_entity')), object_type='E', is_admin=1)
                admins_list = list()
                for a in admins:
                    admins_list.append(a.user_id)

                events_ = models.Event.objects.filter(
                    status=status, start_time__month=int(request.POST.get(
                        'curr_month'))+1,
                    start_time__year=int(request.POST.get('curr_year')), location_id=int(request.POST.get('id_entity')),
                    owner_id__in=admins_list).order_by('start_time')
            else:
                if int(request.POST.get('curr_month')) > 11:
                    current_month = int(request.POST.get('curr_month'))-11
                else:
                    current_month = int(request.POST.get('curr_month'))+1

                events_ = models.Event.objects.filter(
                    status=status, start_time__month=current_month,
                    start_time__year=int(request.POST.get('curr_year'))).order_by('start_time')
            if int(request.POST.get('curr_month')) == 100:
                events_ = models.Event.objects.filter(status=status, name__icontains=request.POST['field_search'])

            #if request.POST.get('id_entity') is not None:
            #    if int(request.POST['id_entity']) != -1:
            #        events_ = models.Event.objects.filter(
            #            status=status, location_id=request.POST['id_entity'])

        events = list()
        for event in events_:

            event_data = list()
            event_data.append(event.name)
            event_data.append(event.start_time.day)
            event_data.append(event.start_time.isoweekday())
            event_data.append(event.picture)
            event_data.append(event.description)
            if str(event.start_time.minute) == '0':
                min = '00'
            else:
                min = str(event.start_time.minute).zfill(2)
            event_data.append(
                str(event.start_time.hour).zfill(2)+':'+min)
            event_data.append(event.id)
            event_data.append(event.location_name)
            event_data.append(event.owner_id)
            event_data.append(event.start_time.month)
            event_data.append(event.fb_id)
            is_attending = False
            if request.user.is_authenticated():
                assist_event = models.AssistEvent.objects.filter(
                    user_id=request.user.id, event_id=event.id)
            else:
                assist_event = False
            if assist_event:
                if assist_event[0].is_attending:
                    is_attending = True

            if event.owner_id == request.user.id:
                is_attending = True

            event_data.append(is_attending)
            if int(request.POST.get('id_entity')) == -1:
                admins = models.MemberToObject.objects.filter(
                    object=event.location_id, object_type='E', is_admin=1)
                admins_list = list()
                for a in admins:
                    admins_list.append(a.user_id)
                match = 0
                for ele in admins_list:
                    if request.user.id == ele:
                        match += 1
                if match == 0:
                    event_data.append(False)
                else:
                     event_data.append(True)
            else:
                if request.user.id == event.owner_id:
                    event_data.append(True)
                else:
                    event_data.append(False)
            events.append(event_data)

    context = {
        'events': list(events)
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def event_view(request, **kwargs):

    template = kwargs['template_name']
    entity = kwargs['event_id']
    id_event = int(entity)
    event = Event.objects.get(id=id_event)
    spot = ''

    address = ''
    if event.place_spot == 1:
        spot = models.Entity.objects.filter(
            type__name='spot', name=event.location_name)
        if spot:
            address = spot[0].address


    arraymonth = ('Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                'Agosto','Septiembre','Octubre','Noviembre','Diciembre')
    arrayday = ('Lunes','Martes','Miercoles','Jueves','Viernes',
                    'Sabado','Domingo')

    weekday = arrayday[event.start_time.weekday()]
    month = arraymonth[event.start_time.month-1]
    day = event.start_time.day
    year = event.start_time.year
    categories = models.EntityCategory.objects.filter(id=event.location.id)
    events_q = {}
    list_events = models.Event.objects.all().exclude(id=event.id)[0:6]

    for obj in list_events:
        category = models.EntityCategory.objects.filter(entity = obj.location)

        for cat1 in category:
            for cat2 in categories:
                if cat1 == cat2:
                    events_q[obj.id] = obj

    date = {
        'weekday': weekday,
        'day': day,
        'month': month,
        'year': year
    }
    assist_event = models.AssistEvent.objects.filter(
        user=request.user.id)
    is_attending = False

    if assist_event:
        if assist_event[0].is_attending:
            is_attending = True

    if event.owner_id == request.user.id:
        is_attending = True

    context = {
        'event': event,
        'date': date,
        'spot': spot,
        'list_event': events_q,
        'address': address.split('#'),
        'is_attending': is_attending
    }

    if 'post' in request.POST:
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')

    return render(request, template, context)


def event(request, **kwargs):
    template = kwargs['template_name']
    context = {
        'entity_type': 'Event'
    }
    events = models.Event.objects.all()

    unescaped = load_calendar(events)

    context = {
        'entity_type': 'Event',
        'entity': 'wime',
        'calendar': unescaped
    }
    return render(request, template, context)


def advanced_search(request, **kwargs):
    template = kwargs['template_name']
    context = {}
    if 'fields' in request.POST:
        data = ast.literal_eval(request.POST.get('fields'))
        app = str(data['type']).split('.')
        app_label = app[0]
        model_name = app[1]
        model = get_model(app_label, model_name)
        query_list = ast.literal_eval(data['value'])
        q_list = list()
        all_objs = False
        for key in query_list:
            if '__in' in key:
                val = ast.literal_eval(query_list[key])
                if int(val[0]) != -1:
                    t = (key, val)
                    q_list.append(t)
                else:
                    all_objs = True
            elif '__gt' in key:
                if query_list[key] != '':
                    date = views.datetime_from_str(query_list[key])[1]
                    t = (key, date)
                    q_list.append(t)
            elif '__lt' in key:
                if query_list[key] != '':
                    date = views.datetime_from_str(query_list[key])[1]
                    t = (key, date)
                    q_list.append(t)
            elif 'distance' in key:
                if query_list[key] != '':
                    distance = query_list[key].split('&')
                    latitude = Decimal(distance[1])
                    longitude = Decimal(distance[2])
                    distance = float(distance[0])
            else:
                t = (key, query_list[key])
                q_list.append(t)
        query = [Q(x) for x in q_list]

        activity = None
        if 'join' in data:
            if data['join'] != 'none':
                join = ast.literal_eval(data['join'])
            else:
                join = []
            if 'activity' in join:
                activity = join['activity']['0']

        if data['and'] == 0:
            if all_objs:
                object = model.objects.all()
            else:
                object = model.objects.filter(reduce(operator.or_, query))
        else:
            object = model.objects.filter(reduce(operator.and_, query))
        if not object:
            context = {
                'response': 0
            }
            context = simplejson.dumps(context)
            return HttpResponse(context, mimetype='application/json')
        value = {}
        #fields = [item for item in fields if item not in fields_foreign]
        # remove = [0, 3, 5, 6, 7, 8, 10, 11]
        list_elements = list()
        if 'type' in join:
            filter_type = ast.literal_eval(join['type']['0'])
            filter_list_type = list()
            filter_default = list()
            for type_ in filter_type:
                if isinstance(type_, int):
                    filter_default.append(type_)
                else:
                    filter_list_type.append(type_)
            q_list = [('user_id', request.user.id)]
            if filter_list_type:
                for element in filter_list_type:
                    q_list.append(('type', element))
            if filter_default:
                for element in filter_default:
                    q_list.append(('default_type', element))
            query = [Q(x) for x in q_list]
            users_lists = account_models.List.objects.filter(reduce(operator.and_, query))
            for ele in users_lists:
                for search in filter_type:
                    if search == 'A':
                        parent = str('account.author').split('.')
                        child = str('account.listauthor').split('.')
                    elif search == 'G':
                        parent = str('account.genre').split('.')
                        child = str('account.listgenre').split('.')
                    else:
                        parent = str('account.title').split('.')
                        child = str('account.listtitle').split('.')

                    app_label = parent[0]
                    parent_model_name = parent[1]
                    parent_model = get_model(app_label, parent_model_name)

                    app_label = child[0]
                    model_name = child[1]
                    child_model = get_model(app_label, model_name)
                    q_list = [(model_name+'__list_id', ele.id)]
                    if 'filters' in join:
                        filters = ast.literal_eval(join['filters']['0'])
                        for filter in filters:
                            q_list.append((filter[0], filter[1]))
                    query = [Q(x) for x in q_list]
                    list_objects = parent_model.objects.filter(reduce(operator.and_, query))
                    if list_objects is None:
                        break
                    for o in list_objects:
                        if model_name == 'listtitle':
                            list_elements.append(o.title)
                        else:
                            list_elements.append(o.name)
            filtered_users = list()

        fields = ast.literal_eval(str(data['fields']))

        for obj in object:
            flag = False
            if activity and model_name == 'activity':
                is_reading = account_models.Activity.objects.filter(user_id=obj.id, type='T')
                if not is_reading:
                    break
                is_reading_list = list()
                for reading in is_reading:
                    is_reading_list.append(reading.object)
                titles = account_models.Title.objects.filter(id__in=is_reading_list)
                titles_list = list()
                for title in titles:
                    titles_list.append(str(title.title).lower())
                match = set(activity) & set(titles_list)
                if not match:
                    break
            if 'distance' in query_list:
                if query_list['distance'] != '':
                    if obj.lat != '' and obj.long != '':
                        lat = float(obj.lat)
                        lng = float(obj.long)
                        radius = float( 6371 * math.acos( math.cos( math.radians(latitude) ) * math.cos( math.radians( lat ) ) * math.cos( math.radians( lng ) - math.radians(longitude) ) + math.sin( math.radians(latitude) ) * math.sin( math.radians( lat ) ) ) )
                        if radius > distance:
                            break
            context_fields = {'extras': list()}
            if data['join'] != 'none':
                for ele in join['tables']:
                    if 'type' in join:
                        for search in filter_type:
                            if search == 'A':
                                parent = str('account.author').split('.')
                                child = str('account.listauthor').split('.')
                            elif search == 'G':
                                parent = str('account.genre').split('.')
                                child = str('account.listgenre').split('.')
                            else:
                                parent = str('account.title').split('.')
                                child = str('account.listtitle').split('.')

                            app_label = 'account'
                            parent_model_name = 'list'
                            parent_model = get_model(app_label, parent_model_name)
                            q_list = [('user_id', obj.id)]
                            if filter_list_type:
                                for element in filter_list_type:
                                    q_list.append(('type', element))
                            if filter_default:
                                for element in filter_default:
                                    q_list.append(('default_type', element))
                            query = [Q(x) for x in q_list]
                            related_object = parent_model.objects.filter(reduce(operator.and_, query))
                            if not related_object:
                                break
                            app_label = parent[0]
                            model_name = parent[1]
                            parent_model = get_model(app_label, model_name)

                            app_label = child[0]
                            model_name = child[1]
                            child_model = get_model(app_label, model_name)

                            related_object_list = list()
                            q_list = list()
                            for related_obj in related_object:
                                q_list.append((model_name+'__list_id', related_obj.id))
                            query = [Q(x) for x in q_list]

                            related_object = parent_model.objects.filter(reduce(operator.or_, query))
                            for o in related_object:
                                if model_name == 'listtitle':
                                    i = list_elements.index(o.title) if o.title in list_elements else None
                                else:
                                    i = list_elements.index(o.name) if o.name in list_elements else None
                                if i is not None:
                                    if obj.id not in filtered_users:
                                        filtered_users.append(obj.id)

                    models = ast.literal_eval(join['tables'][str(ele)])

                    if 'user_id' in data['fields'] and not flag:
                        related_object = obj.user_id
                        flag = True
                    else:
                        related_object = obj.id

                    parent = str(models[0]).split('.')
                    app_label = parent[0]
                    model_name = parent[1]
                    parent_model = get_model(app_label, model_name)

                    if len(models) > 1:
                        child = str(models[1]).split('.')
                        app_label = child[0]
                        model_name = child[1]
                        child_model = get_model(app_label, model_name)

                    join_field = ast.literal_eval(join['quieres'][str(ele)])

                    if len(models) > 1:
                        q_list = [(model_name+'__'+str(join_field[0]), related_object)]
                    else:
                        q_list = [(str(join_field[0]), related_object)]

                    if model_name == 'activity':
                        q_list.append(('type', 'T'))
                        q_list.append(('activity_id', 9))

                    if model_name == 'rate':
                        q_list.append(('type__in', activity))
                    query = [Q(x) for x in q_list]
                    related_object = parent_model.objects.filter(reduce(operator.and_, query))
                    if model_name == 'activity':
                        if related_object:
                            related_object = account_models.Title.objects.filter(id=related_object[0].object)
                    if len(models) <= 2:
                        values = list()
                        for related_obj in related_object:
                            join_field = ast.literal_eval(join['fields'][str(ele)])
                            for val in join_field:
                                if isinstance(related_obj.__getattribute__(val), unicode):
                                    values.append(related_obj.__getattribute__(val).encode('utf-8', 'ignore'))
                                else:
                                    field_value = str(related_obj.__getattribute__(str(val)))
                                    values.append(field_value)
                        context_fields['extras'].append(values)

            for val in fields:
                if isinstance(obj.__getattribute__(val), unicode):
                    context_fields[str(val)] = obj.__getattribute__(val).encode('utf-8', 'ignore')
                else:
                    field_value = str(obj.__getattribute__(str(val)))
                    context_fields[str(val)] = field_value
            if 'type' in join:
                if filter_type:
                    if obj.id in filtered_users:
                        value[obj.id] = context_fields
                else:
                    value[obj.id] = context_fields
            else:
                value[obj.id] = context_fields
        context = simplejson.dumps(value)
        return HttpResponse(context, mimetype='application/json')
    return render(request, template, context)


@login_required(login_url='/')
def get_list(request, **kwargs):
    template = kwargs['template_name']

    type = ['listas', 'list']
    list = account_models.List.objects.filter(default_type=-1,status=True)

    if request.POST.get('field_value')!=None:
        search = request.POST['field_value']
        if int(request.POST.get('type_list')) == 1:
            list = account_models.List.objects.filter(name__icontains=search, default_type=-1,
                                          status=True)
        else:
            user = models.User.objects.get(id=request.POST.get('id_profile'))
            list = account_models.List.objects.filter(name__icontains=search, default_type=-1,
                                          status=True, user=user)

    content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. '

    fields_related_objects = account_models.List._meta.get_all_related_objects(
        local_only=True)
    fields = account_models.List._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = account_models.List._meta.get_all_field_names()
        fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    dictionary = dict()

    for obj in list:

        user = {}
        count = 0

        if obj.type == 'T':
            titles = account_models.ListTitle.objects.filter(list=obj)
            count = len(titles)

        if obj.type == 'A':
            authors = account_models.ListAuthor.objects.filter(list=obj)
            count = len(authors)

        grade_title = 0
        rate_title = account_models.Rate.objects.filter(element_id=obj.id).values('element_id').\
            annotate(count = db_model.Count('element_id'), score = db_model.Avg('grade'))

        if len(rate_title) != 0:
            grade_title = rate_title[0]['score']

        user['count'] = count
        user['type'] = obj.type
        user['grade'] = grade_title

        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                user[str(field)] = obj.__getattribute__(str(field)).\
                    encode('utf-8', 'ignore')
            else:
                if field=='user':
                    value = str(obj.__getattribute__(str(field)))
                    user['id_user'] = int(obj.__getattribute__(str(field)).id)
                else:
                    value = str(obj.__getattribute__(str(field)))
                user[str(field)] = value

        dictionary[int(obj.id)] = user

    context = {
        'list':dictionary,
        'content':content,
        'type':type
    }


    if request.POST.get('field_value')!=None:
        context = simplejson.dumps(dictionary)
        return HttpResponse(context, mimetype='application/json')

    return render(request, template, context)


@login_required(login_url='/')
def get_titles(request,**kwargs):
    template = kwargs['template_name']

    type = ['Títulos', 'Title']
    dict_items = {}
    book = account_models.Title.objects.all()

    if request.POST.get('field_value')!=None:
        search = request.POST['field_value']
        book = account_models.Title.objects.filter(title__icontains=search)

    content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. '

    list_author = account_models.AuthorTitle.objects.all()

    fields_related_objects = account_models.Title._meta.get_all_related_objects(
        local_only=True)
    fields = account_models.Title._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    for obj in book:
        items = {}
        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                items[field] = obj.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                items[field] = str(obj.__getattribute__(str(field)))

        grade_title = 0
        rate_title = account_models.Rate.objects.filter(element_id=obj.id). \
            values('element_id'). \
            annotate(count = db_model.Count('element_id'),
                     score = db_model.Avg('grade'))

        if len(rate_title) != 0:
            grade_title = rate_title[0]['score']

        author_name = 'Autor Anónimo'
        id_author = 0
        author =  account_models.AuthorTitle.objects.filter(title=obj)

        if len(author) != 0:
            author_name = author[0].author.name
            id_author = author[0].author.id

        genre = []
        genres = account_models.GenreTitle.objects.filter(title=obj)
        for genr in genres:
            genre.append(genr.genre.name)

        items['genre'] = genre
        items['author'] = author_name
        items['id_author'] = id_author
        items['grade'] = grade_title
        dict_items[int(obj.id)] = items

    context = {
        'book': dict_items,
        'content': content,
        'type': type,
        'list_author':list_author
    }

    if request.POST.get('field_value')!=None:
        context = simplejson.dumps(dict_items)
        return HttpResponse(context, mimetype='application/json')

    return render(request, template, context)

@login_required(login_url='/')
def get_authors(request, **kwargs):
    template = kwargs['template_name']
    dict_items = {}
    type = ['Autores', 'Author']
    authors = account_models.Author.objects.all()

    if request.POST.get('field_value')!=None:
        search = request.POST['field_value']
        authors = account_models.Author.objects.filter(name__icontains=search)


    content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. '
    context = {
        'authors':authors,
        'content':content,
        'type':type
    }

    fields_related_objects = account_models.Author._meta.get_all_related_objects(
        local_only=True)
    fields = account_models.Author._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = account_models.Author._meta.get_all_field_names()
        fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    dictionary_authors = {}

    for obj in authors:
        items = {}
        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                items[field] = obj.__getattribute__(str(field)).encode('utf-8', 'ignore')
            else:
                items[field] = str(obj.__getattribute__(str(field)))

        count_titles = account_models.AuthorTitle.objects.filter(author=obj).values('author'). \
            annotate(count = db_model.Count('title'))

        count = 0
        if len(count_titles) != 0:
            count = count_titles[0]['count']

        items['count'] = count
        dict_items[int(obj.id)] = items

    context = {
        'authors':dict_items,
        'content':content,
        'type':type
    }

    if request.POST.get('field_value')!= None:
        context = simplejson.dumps(dict_items)
        return HttpResponse(context, mimetype='application/json')

    return render(request, template, context)


def get_genre(request):
    id_user = request.user
    list_genre = account_models.Genre.objects.all()
    list_genre_favorite = account_models.ListGenre.objects.filter(list__user=id_user,
                                                                   list__type='G')
    fields_related_objects = account_models.Genre._meta.get_all_related_objects(
        local_only=True)
    fields = account_models.Genre._meta.get_all_field_names()

    fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = account_models.Genre._meta.get_all_field_names()
        fields_foreign = []

    for related_object in fields_related_objects:
        fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

    fields = [item for item in fields if item not in fields_foreign]

    dictionary_genre = {}

    for obj in list_genre:
        genre = {}
        for field in fields:
            if isinstance(obj.__getattribute__(str(field)), unicode):
                if field == 'date':
                    genre[str(field)] = str(obj.__getattribute__(str(field)).\
                    encode('utf-8', 'ignore'))
                else:
                    genre[str(field)] = obj.__getattribute__(str(field)).\
                    encode('utf-8', 'ignore')
            else:
                if field == 'date':
                    genre[str(field)] = str(obj.__getattribute__(str(field)))
                else:
                    genre[str(field)] = obj.__getattribute__(str(field))
            active = True
            for g in list_genre_favorite:
                if g.genre.id == obj.id and g.status:
                    active = False
                    break
            genre['active'] = active

        dictionary_genre[str(obj.id)] = genre

    context = simplejson.dumps(dictionary_genre)

    return HttpResponse(context, mimetype='application/json')


@login_required(login_url='/')
def get_profile(request, **kwargs):
    template = kwargs['template_name']
    type = kwargs['type']
    profile = kwargs['profile']
    user = request.user
    context = {}

    dict_items = {}
    list_picture = models.Profile.objects.all()

    if type == 'author':
        profile = account_models.Author.objects.get(id=profile)
        list = account_models.ListAuthor.objects.filter(author=profile, list__status=True)
        list_titles = account_models.AuthorTitle.objects.filter(author=profile)
        rate = account_models.Rate.objects.filter(element_id=profile.id, type='A').\
                values('element_id').annotate(count = db_model.Count('element_id'), score = db_model.Avg('grade'))
        my_rate = account_models.Rate.objects.filter(user=user, element_id=profile.id,
                                                  type='A')


        fields_related_objects = account_models.Title._meta.get_all_related_objects(
            local_only=True)
        fields = account_models.Title._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        for obj in list_titles:
            items = {}
            for field in fields:
                if isinstance(obj.title.__getattribute__(str(field)), unicode):
                    items[field] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    items[field] = obj.title.__getattribute__(str(field))

            grade_title = 0
            rate_title = account_models.Rate.objects.filter(element_id=obj.title.id).\
                values('element_id').\
            annotate(count = db_model.Count('element_id'),
                     score = db_model.Avg('grade'))

            if len(rate_title) != 0:
                grade_title = rate_title[0]['score']

            author_name = 'Autor Anónimo'

            author =  account_models.AuthorTitle.objects.filter(title=obj.title)

            if len(author) != 0:
                author_name = author[0].author.name

            items['author'] = author_name
            items['grade'] = grade_title
            dict_items[int(obj.title.id)] = items

        count_vot = 0
        count_rate = 0
        my_vot = 0
        if len(rate) > 0:
            count_vot = rate[0]['count']
            count_rate = rate[0]['score']
        if len(my_rate) > 0:
            my_vot = my_rate[0].grade

        context = {
            'list_titles': dict_items,
            'list': list,
            'count': len(list_titles),
            'my_grade': len(my_rate),
            'count_rate': count_rate,
            'my_vot': my_vot,
            'range': range(5),
            'count_vot': count_vot
        }

    if type == 'title':
        profile = account_models.Title.objects.get(id=profile)
        list_user = account_models.ListTitle.objects.filter(list__default_type=1,
                                                          title=profile, list__status=True)
        list_read = account_models.ListTitle.objects.filter(list__default_type=5,
                                                          title=profile, list__status=True)

        rate = account_models.Rate.objects.filter(element_id=profile.id, type='T').\
                values('element_id').annotate(count = db_model.Count('element_id'), score = db_model.Avg('grade'))
        my_rate = account_models.Rate.objects.filter(user=user, element_id=profile.id,
                                                  type='T')

        fields_related_objects = models.Profile._meta.get_all_related_objects(
            local_only=True)
        fields = models.Profile._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        dict_users = {}

        for obj in list_user:
            att = {}
            obj_pro = models.Profile.objects.get(user=obj.list.user)
            for field in fields:
                if isinstance(obj_pro.__getattribute__(str(field)), unicode):
                    att[field] = obj_pro.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    att[field] = obj_pro.__getattribute__(str(field))

            dict_users[int(obj_pro.user.id)] = att

        list = account_models.ListTitle.objects.filter(title=profile, list__status=True,
                                                       list__default_type=-1)
        author = account_models.AuthorTitle.objects.filter(title=profile)

        name_author = 'Autor Anónimo'
        id_author = 0
        if len(author) != 0:
            name_author = author[0].author.name
            id_author = author[0].author.id

        count_vot = 0
        count_rate = 0
        my_vot = 0
        if len(rate) > 0:
            count_vot = rate[0]['count']
            count_rate = rate[0]['score']
        if len(my_rate) > 0:
            my_vot = my_rate[0].grade

        context = {
            'list_user': dict_users,
            'list': list,
            'count': len(list_read),
            'my_grade': len(my_rate),
            'count_rate': count_rate,
            'my_vot': my_vot,
            'range': range(5),
            'count_vot': count_vot,
            'list_picture': list_picture,
            'name_author': name_author,
            'id_author': id_author
        }


    if type == 'list':
        dict_titles = {}
        dict_authors = {}
        profile = account_models.List.objects.get(id=profile)
        rate = account_models.Rate.objects.filter(element_id=profile.id, type='L').\
                values('element_id').annotate(count = db_model.Count('element_id'), score = db_model.Avg('grade'))
        my_rate = account_models.Rate.objects.filter(user=user, element_id=profile.id,
                                                  type='L')

        dict_list_rel = {}

        if profile.type == 'T':
            list_rel = account_models.ListTitle.objects.filter(list__id=profile.id)
            list_rel_other = account_models.ListTitle.objects.filter(list__default_type=-1)
            for obj_rel in list_rel_other:
                equals = False
                for obj_my in list_rel:
                    if obj_my.title == obj_rel.title and obj_my.list != obj_rel.list:
                        equals = True
                if equals:
                    dict_list_rel[int(obj_rel.list.id)] = obj_rel.list

        else:
            list_rel = account_models.ListAuthor.objects.filter(list__id=profile.id)
            list_rel_other = account_models.ListAuthor.objects.filter(list__default_type=-1)
            for obj_rel in list_rel_other:
                equals = False
                for obj_my in list_rel:
                    if obj_my.author == obj_rel.author and obj_my.list != obj_rel.list:
                        equals = True
                if equals:
                    dict_list_rel[int(obj_rel.list.id)] = obj_rel.list

        titles = account_models.ListTitle.objects.filter(list=profile, list__status=True)
        authors = account_models.ListAuthor.objects.filter(list=profile, list__status=True)

        fields_related_objects = account_models.Title._meta.get_all_related_objects(
            local_only=True)
        fields = account_models.Title._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        for obj in titles:
            items = {}
            for field in fields:
                if isinstance(obj.title.__getattribute__(str(field)), unicode):
                    items[field] = obj.title.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    items[field] = obj.title.__getattribute__(str(field))

            grade_title = 0
            rate_title = account_models.Rate.objects.filter(element_id=obj.title.id).\
                values('element_id').\
            annotate(count = db_model.Count('element_id'),
                     score = db_model.Avg('grade'))

            genre = []

            genres = account_models.GenreTitle.objects.filter(title=obj.title)
            for genr in genres:
                genre.append(genr.genre.name)

            if len(rate_title) != 0:
                grade_title = rate_title[0]['score']

            author_name = 'autor anonimo'

            author =  account_models.AuthorTitle.objects.filter(title=obj.title)

            if len(author) != 0:
                author_name = author[0].author.name

            items['author'] = author_name
            items['grade'] = grade_title
            items['genre'] = genre
            dict_titles[int(obj.title.id)] = items

        fields_related_objects = account_models.Author._meta.get_all_related_objects(
            local_only=True)
        fields = account_models.Author._meta.get_all_field_names()

        fields_foreign = []

        for related_object in fields_related_objects:
            fields_foreign.append(
            related_object.get_accessor_name().replace('_set', ''))

        fields = [item for item in fields if item not in fields_foreign]

        for obj in authors:
            items = {}
            for field in fields:
                if isinstance(obj.author.__getattribute__(str(field)), unicode):
                    items[field] = obj.author.__getattribute__(str(field)).encode('utf-8', 'ignore')
                else:
                    items[field] = obj.author.__getattribute__(str(field))

            count_titles = account_models.AuthorTitle.objects.filter(author=obj.author).values('author').\
            annotate(count = db_model.Count('title'))

            count = 0
            if len(count_titles) != 0:
                count = count_titles[0]['count']

            items['count'] = count
            items['default_type'] = obj.list.default_type
            items['id_list'] = obj.list.id
            dict_authors[int(obj.author.id)] = items


        count_vot = 0
        count_rate = 0
        my_vot = 0
        if len(rate) > 0:
            count_vot = rate[0]['count']
            count_rate = rate[0]['score']
        if len(my_rate) > 0:
            my_vot = my_rate[0].grade

        context = {
            'titles': dict_titles,
            'authors': dict_authors,
            'list': dict_list_rel,
            'my_grade': len(my_rate),
            'count_rate': count_rate,
            'my_vot': my_vot,
            'range': range(5),
            'count_vot': count_vot
        }

    context['type'] = type
    context['profile'] = profile
    context['SITE_URL'] = settings.SITE_URL

    return render(request, template, context)


def search_api(request, **kwargs):
    if int(request.POST.get('aux_api')) == -1:
        isbn = request.POST.get('search')
        url = 'https://www.goodreads.com/book/isbn?format=xml&isbn='+isbn.replace('"', '')+'&key='+settings.GOODREADS_KEY
        error = dict()
        try:
            response = urllib2.urlopen(url).read()
        except Exception as e:
            error = e.__dict__

        if 'code' in error:
            context = {
                'result_api': -1
            }
        else:
            dom = minidom.parseString(response)
            context = {
                'result_api': dom.childNodes.__contains__('error')
            }
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')
    search = ast.literal_eval(request.POST.get('search'))
    q_ast = ast.literal_eval(search['q'])
    index = str(search['start_index']['0'])
    type = search['type']['0'].split('.')
    type = type[1]
    q = ''
    query = ''
    key = '&key='+settings.GOOGLE_BOOKS_KEY
    startIndex = '&startIndex='+index
    languageRestrict = '&langRestrict=es'
    search_author = '&limit=10&lang=es&filter=(all+type:%2Fbook%2Fauthor)&output=(%2Fcommon%2Ftopic%2Fimage+%2Fbook%2Fauthor%2Fworks_written+description)'
    for element in q_ast:
        q += element + '+'

    if 'particular_fields' in search:
        size_fields = len(search['particular_fields'])
        for i in range(size_fields):
            particular_fields = search['particular_fields'][str(i)] + ':'
        terms = ast.literal_eval(search['particular_fields_terms'][str(i)])
        terms = '+'.join(terms) + '+'
        particular_fields += terms
        query += particular_fields
        query = q+query[:-1]
    else:
        query = q[:-1]
    if type == 'title':
        url = 'https://www.googleapis.com/books/v1/volumes?q='
        query += startIndex + key
        url += query
    else:
        url = 'https://www.googleapis.com/freebase/v1/search?query='
        query += search_author + key
        url += query
    response = urllib2.urlopen(url)
    response = simplejson.load(response)

    if 'items' in response:
        pass
    elif 'cost' in response:
        pass
    else:
        response = 'No se pudieron encontraron más libros en su búsqueda'
    context = {
        'result_api': response
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def get_a_discussion(request):
    if 'erase' in request.POST:
        discussion = account_models.Discussion.objects.get(
            id=int(request.POST.get('erase')))
        discussion.status = 0
        discussion.save()
        context = {

        }
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')
    discussion = account_models.Discussion.objects.get(
        id=int(request.POST.get('id')))
    discussion_list = get_discussion(discussion=discussion)
    res = list()
    for lis in discussion_list:
        results = [ele.as_json() for ele in lis]
        res.append(results)
    context = {
        'parent': discussion.parent_as_json(),
        'discussion': res
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def create_discussion(request):
    discussion = account_models.Discussion.objects.create(
        entity_id=int(request.POST.get('entity_id')), name=request.POST.get('name'),
        content=request.POST.get('content'), user_id=request.user.id)

    context = {
        'response': discussion.parent_as_json()
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def respond_to_discussion(request):
    response = account_models.Discussion.objects.create(
        entity_id=int(request.POST.get('entity_id')),
        parent_discussion_id=int(request.POST.get('parent_discussion')),
        content=request.POST.get('response'), user_id=request.user.id)
    context = {
        'response': response.as_json()
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def get_discussion(discussion):
    discussion_list = list()
    discussions = account_models.Discussion.objects.filter(
        parent_discussion_id=discussion.id, status=True).order_by('-date')

    for discuss in discussions:
        discuss_list = list()
        discuss_list.append(discuss)
        discussions_2nd_level = account_models.Discussion.objects.filter(
            parent_discussion_id=discuss.id, status=True).order_by('-date')
        for dis in discussions_2nd_level:
            discuss_list.append(dis)
        discussion_list.append(discuss_list)
    return discussion_list


#def get_discussion(discussion, l):
#    discussion_list = l
#    discussion = account_models.Discussion.objects.filter(
#        parent_discussion_id=discussion.id)
#
#    if discussion:
#        l.append(discussion[0])
#        get_discussion(discussion[0], discussion_list)
#        return l
#    return discussion_list


def load_picture_profile(request):

    user = request.user

    profile = models.Profile.objects.get(user=user)
    picture = ''
    if profile.picture:
        picture = profile.picture
    context = {
        'id_user': user.id,
        'picture': picture
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


@login_required(login_url='/')
def get_page(request, **kwargs):

    template = kwargs['template_name']
    page_id = kwargs['page_id']
    user_id = kwargs['user_id']
    page = account_models.Page.objects.get(id=page_id)
    list_pages = account_models.Page.objects.filter(user__id=user_id, status=True).\
        exclude(id=page_id,)
    profile = models.Profile.objects.get(user__id=user_id)
    context = {
        'page':page,
        'list_pages':list_pages,
        'type':'page',
        'profile':profile
    }

    return render(request, template, context)


def book_crossing(request, **kwargs):

    template = kwargs['template_name']
    dict_1 = {}
    dict_2 = {}

    for i in range(2):
        books = models.Travel.objects.filter(status=i)
        print books
        for obj in books:
            if int(obj.type_user) == 1:
                user_book = account_models.User.objects.get(id=obj.user)
                user_book = user_book.username
            else:
                user_book = models.ExternalUser.objects.get(id=obj.user)
                user_book = user_book.name

            if i == 1:
                dict_1[obj.book.id] = {
                    'user': user_book,
                    'travel': obj
                }
            else:
                dict_2[obj.book.id] = {
                    'user': user_book,
                    'travel': obj
                }

    context = {
        'books_1': dict_1,
        'books_2': dict_2
    }

    return render(request, template, context)


def book(request, **kwargs):
    template = kwargs['template_name']

    #state_1 = encontrado, state_2 = liberado
    code = kwargs['code']
    user = request.user
    user_active = False
    find_user = ''

    active = str(code).split('_')
    cheking = False
    user_cheking = False

    code = active[0]
    book = models.Book.objects.get(code=code)
    list_users = models.Travel.objects.filter(book__code=code).order_by('date')

    count_user =models.Travel.objects.filter(db_model.Q(book__code=code) &
                                             db_model.Q(status=0)).values('user').\
                                                annotate(count = db_model.Count('user'))

    status_book = models.Travel.objects.filter(book__code=code).latest('id')
    create_user = models.Travel.objects.filter(book__code=code)

    if status_book:
        if int(status_book.type_user) == 1:
            find_user = models.Profile.objects.filter(user__id=status_book.user)
            if find_user:
                find_user = {
                    'name': find_user[0].user.username
                }
        else:
            find_user = models.ExternalUser.objects.filter(id=status_book.user)
            if find_user:
                find_user = {
                    'name': find_user[0].name
                }

        if request.user :
            exist_cheking = models.Travel.objects.filter(user=request.user.id, book__code = code).exclude(status=0)
            if exist_cheking and status_book.status == 1:
                user_cheking = True

    if int(active[1]) == 1 and not user_cheking:
        cheking = True

    state_1 = models.Travel.objects.filter(book__code=code, status=0)
    state_2 = models.Travel.objects.filter(book__code=code, status=1)

    dict = {}
    index = 1
    for obj in list_users:
        picture = ''
        if int(obj.type_user) == 1:
            user_book = account_models.User.objects.get(id=obj.user)
            user_book = user_book.username
            picture = models.Profile.objects.get(user__id=obj.user)
            picture = picture.picture
        else:
            user_book = models.ExternalUser.objects.get(id=obj.user)
            user_book = user_book.name

        dict[index] = {
            'user': user_book,
            'travel': obj,
            'picture': picture
        }
        index = index + 1

    context = {
        'book': book,
        'create_user': create_user,
        'user_': user,
        'list_users': dict,
        'state_1': state_1,
        'state_2': state_2,
        'count_user': count_user,
        'cheking': cheking,
        'settings': settings,
        'status_book': status_book,
        'find_user': find_user
    }

    return render(request, template, context)


def qr_book(request, **kwargs):
    template = kwargs['template_name']
    code = kwargs['book_code']
    url = settings.SITE_URL+'qro_lee/book/'+code+'_1'
    image = generate(url)
    path = os.path.join(os.path.dirname(__file__), '..', 'static/qr/').replace('\\','/')
    file = open(path+code+".png", "wb")
    file.write(image)
    file.close()
    context = {
        'code': code,
        'url': url,
        'img': code
    }
    return render(request, template, context)


def generate(content, format="png"):
    query = urllib.urlencode({
        "content": content,
        "format": format
    })
    con = httplib.HTTPConnection("www.esponce.com")
    con.request("GET", "/api/v3/generate?" + query)
    response = con.getresponse()
    image = response.read()
    con.close()
    return image


def load_calendar(events):
    events_months = []
    for event in events:
        # Event date = Month, day, id
        event_date = list()
        event_date.append(event.start_time.month)
        event_date.append(event.start_time.day)
        event_date.append(int(event.id))
        event_date.append(event.start_time.year)
        events_months.append(event_date)
    hc = calendar.HTMLCalendar(calendar.SUNDAY)
    nextHc = hc.formatyear((datetime.datetime.now().year+1), 12)
    hc = hc.formatyear(datetime.datetime.now().year, 12)
    year = ' '+str(datetime.datetime.now().year)
    nyear = ' '+str(datetime.datetime.now().year+1)
    hc = hc.replace('Sun', 'D')
    hc = hc.replace('Mon', 'L')
    hc = hc.replace('Tue', 'M')
    hc = hc.replace('Wed', 'M')
    hc = hc.replace('Thu', 'J')
    hc = hc.replace('Fri', 'V')
    hc = hc.replace('Sat', 'S')

    hc = hc.replace('dom', 'D')
    hc = hc.replace('lun', 'L')
    hc = hc.replace('mar', 'M')
    hc = hc.replace('mié', 'M')
    hc = hc.replace('jue', 'J')
    hc = hc.replace('vie', 'V')
    hc = hc.replace('sáb', 'S')

    nextHc = nextHc.replace('Sun', 'D')
    nextHc = nextHc.replace('Mon', 'L')
    nextHc = nextHc.replace('Tue', 'M')
    nextHc = nextHc.replace('Wed', 'M')
    nextHc = nextHc.replace('Thu', 'J')
    nextHc = nextHc.replace('Fri', 'V')
    nextHc = nextHc.replace('Sat', 'S')

    nextHc = nextHc.replace('dom', 'D')
    nextHc = nextHc.replace('lun', 'L')
    nextHc = nextHc.replace('mar', 'M')
    nextHc = nextHc.replace('mié', 'M')
    nextHc = nextHc.replace('jue', 'J')
    nextHc = nextHc.replace('vie', 'V')
    nextHc = nextHc.replace('sáb', 'S')

    hc = hc.replace('January', 'Enero' + year)
    hc = hc.replace('February', 'Febrero' + year)
    hc = hc.replace('March', 'Marzo' + year)
    hc = hc.replace('April', 'Abril' + year)
    hc = hc.replace('May', 'Mayo' + year)
    hc = hc.replace('June', 'Junio' + year)
    hc = hc.replace('July', 'Julio' + year)
    hc = hc.replace('August', 'Agosto' + year)
    hc = hc.replace('September', 'Septiembre'+ year)
    hc = hc.replace('October', 'Octubre' + year)
    hc = hc.replace('November', 'Noviembre' + year)
    hc = hc.replace('December', 'Diciembre' + year)

    hc = hc.replace('enero', 'Enero' + year)
    hc = hc.replace('febrero', 'Febrero' + year)
    hc = hc.replace('marzo', 'Marzo' + year)
    hc = hc.replace('Mzo', 'Marzo' + year)
    hc = hc.replace('abril', 'Abril' + year)
    hc = hc.replace('mayo', 'Mayo' + year)
    hc = hc.replace('junio', 'Junio' + year)
    hc = hc.replace('julio', 'Julio' + year)
    hc = hc.replace('agosto', 'Agosto' + year)
    hc = hc.replace('septiembre', 'Septiembre'+ year)
    hc = hc.replace('octubre', 'Octubre' + year)
    hc = hc.replace('noviembre', 'Noviembre' + year)
    hc = hc.replace('noVmbre', 'Noviembre' + year)
    hc = hc.replace('diciembre', 'Diciembre' + year)

    nextHc = nextHc.replace('January', 'Enero' + nyear)
    nextHc = nextHc.replace('February', 'Febrero' + nyear)
    nextHc = nextHc.replace('March', 'Marzo' + nyear)
    nextHc = nextHc.replace('April', 'Abril' + nyear)
    nextHc = nextHc.replace('May', 'Mayo' + nyear)
    nextHc = nextHc.replace('June', 'Junio' + nyear)
    nextHc = nextHc.replace('July', 'Julio' + nyear)
    nextHc = nextHc.replace('August', 'Agosto' + nyear)
    nextHc = nextHc.replace('September', 'Septiembre'+ nyear)
    nextHc = nextHc.replace('October', 'Octubre' + nyear)
    nextHc = nextHc.replace('November', 'Noviembre' + nyear)
    nextHc = nextHc.replace('December', 'Diciembre' + nyear)

    nextHc = nextHc.replace('enero', 'Enero' + nyear)
    nextHc = nextHc.replace('febrero', 'Febrero' + nyear)
    nextHc = nextHc.replace('marzo', 'Marzo' + nyear)
    nextHc = nextHc.replace('Mzo', 'Marzo' + nyear)
    nextHc = nextHc.replace('abril', 'Abril' + nyear)
    nextHc = nextHc.replace('mayo', 'Mayo' + nyear)
    nextHc = nextHc.replace('junio', 'Junio' + nyear)
    nextHc = nextHc.replace('julio', 'Julio' + nyear)
    nextHc = nextHc.replace('agosto', 'Agosto' + nyear)
    nextHc = nextHc.replace('septiembre', 'Septiembre'+ nyear)
    nextHc = nextHc.replace('octubre', 'Octubre' + nyear)
    nextHc = nextHc.replace('noviembre', 'Noviembre' + nyear)
    nextHc = nextHc.replace('noVmbre', 'Noviembre' + nyear)
    nextHc = nextHc.replace('diciembre', 'Diciembre' + nyear)

    html_parser = HTMLParser.HTMLParser()
    unescaped = html_parser.unescape(hc)
    unescaped += html_parser.unescape(nextHc)
    return unescaped


def write_pdf(template_src, context_dict):
    template = get_template(template_src)
    context = Context(context_dict)
    html = template.render(context)
    result = StringIO.StringIO()
    pdf = pisa.pisaDocument(StringIO.StringIO(
        html.encode("UTF-8")), result)
    if not pdf.err:
        return HttpResponse(
            result.getvalue(), mimetype='application/pdf')
    return HttpResponse('Gremlins ate your pdf! %s' % cgi.escape(html))


def qr_to_pdf(request, **kwargs):
    template = kwargs['template_name']
    context = {
        'site_url': settings.SITE_URL,
        'qr': kwargs['qr_code']
    }
    return write_pdf(template, context)


def policy_use(request, **kwargs):
    template = kwargs['template_name']
    context = {
        'type': int(kwargs['type'])
    }
    if int(kwargs['type']) == 6:
        template = '404.html'
    return render(request, template, context)
