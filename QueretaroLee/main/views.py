# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models.loading import get_model
from django.db import models as db_model
from django.db.models import Q

from registry.models import Entity,Type,Event
from account import models as account_models
from registry import models,views,settings

from collections import namedtuple
from decimal import Decimal
import simplejson
import calendar
import HTMLParser
import datetime
import ast
import operator
import math
import urllib2


@login_required(login_url='/')
def index(request, **kwargs):
    template = kwargs['template_name']
    if request.user.is_authenticated():
        activity_list = list()
        user = request.user
        profile = models.Profile.objects.get(user_id=user)

        following = account_models.Activity.objects.filter(
            user_id=user.id, activity_id=5)
        following_list = list()
        for follow in following:
            following_list.append(follow.object)

        activity = account_models.Activity.objects.filter(
            added_to_object__in=following_list).order_by('-date')

        for feed in activity:
            activity_list.append(feed)

    else:
        return HttpResponseRedirect('/')

    context = {
        'user': user,
        'profile': profile,
        'activity': activity
    }
    return render(request, template, context)


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

    user = models.User.objects.filter(
        username=request.user)
    entity_ids = list()
    user_ids = list()
    for ele in entity_type_ids:
        entity_ids.append(ele.id)
    for u in user:
        user_ids.append(u.id)

    entity = models.Entity.objects.filter(
        type_id__in=entity_ids, status=status).exclude(user_id=request.user)

    user_entities = models.Entity.objects.filter(
        type_id__in=entity_ids, user_id__in=user_ids, status=status)

    if request.POST.get('field_search_entity'):
        if request.POST['field_search_entity']=='*':
            entity = models.Entity.objects.filter(
                type_id__in=entity_ids, status=status).exclude(user_id=request.user)
        else:
            search = request.POST['field_search_entity']
            entity = models.Entity.objects.filter(
                type_id__in=entity_ids, name__icontains=search, status=status).\
                exclude(user_id=request.user)
            user_entities = models.Entity.objects.filter(
                type_id__in=entity_ids, user_id__in=user_ids,
                name__icontains=search, status=status)

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
        context_fields = {}
        for data in fields:
            if isinstance(obj.__getattribute__(data), unicode):
                context_fields[str(data)] = obj.__getattribute__(data).encode('utf-8', 'ignore')
            else:
                field_value = str(obj.__getattribute__(str(data)))
                if str(data) == 'user':
                    field_value = str(obj.__getattribute__(str(data)).id)
                context_fields[str(data)] = field_value

        value[obj.id] = context_fields

    for obj in user_entities:
        context_fields = {}
        for data in fields:
            if isinstance(obj.__getattribute__(data), unicode):
                context_fields[str(data)] = obj.__getattribute__(data).encode('utf-8', 'ignore')
            else:
                field_value = str(obj.__getattribute__(str(data)))
                if str(data) == 'user':
                    field_value = str(obj.__getattribute__(str(data)).id)
                context_fields[str(data)] = field_value

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
            entity_type = ['grupos', 'group']
        elif entity_type == 'spot':
            entity_type = ['spots', 'spot']
        else:
            entity_type == 'organization'
            entity_type = ['organizaciones', 'organization']
        content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. ' \
                  'Aenean ultricies mi vitae est. Mauris placerat eleifend leo.' \
                  ' Quisque sit amet est et sapien ullamcorper pharetra. ' \
                  'Vestibulum erat wisi, condimentum sed, commodo vitae, ' \
                  'ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt ' \
                  'condimentum, eros ipsum rutrum orci, sagittis tempus lacus ' \
                  'enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. ' \
                  'Praesent dapibus, neque id cursus faucibus, tortor neque ' \
                  'egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. ' \
                  'Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'

        for e in entity:
            e.address = e.address.split('#')
        for e in user_entities:
            e.address = e.address.split('#')
        context = {
            'entities': entity,
            'entity_type': entity_type,
            'content': content,
            'user_entities': user_entities
        }

        if 'post' in request.POST:
            context = simplejson.dumps(context)
            return HttpResponse(context, mimetype='application/json')

        if entity_type[0] == 'spots':
            context['classspot'] = 'class=scrollspot';
            context['classimage'] = 'd-wrapperspot';

        return render(request, template, context)


def get_entity(request, **kwargs):
    template = kwargs['template_name']
    entity = kwargs['entity'].split('_', 1)

    id_entity = int(entity[1])
    entity = models.Entity.objects.get(id=id_entity)
    categories = models.EntityCategory.objects.filter(
        entity_id=entity.id)
    if request.POST:
        if 'membership' in request.POST:
            membership = int(request.POST.get('membership'))
            entityuser = models.EntityUser.objects.get_or_create(
                user_id=request.user.id, entity_id=entity.id)
            if membership == 1:
                entityuser[0].is_member = True
                entityuser[0].save()
                activity_data = {
                    'user_id': request.user.id,
                    'object': request.user.id,
                    'added_to_object': entity.id,
                    'type': 'U',
                    'added_to_type': 'E',
                    'activity_id': 5
                }
                views.update_activity(activity_data)
            else:
                entityuser[0].is_member = False
                entityuser[0].save()
        elif 'follow_private' in request.POST:
            membership = int(request.POST.get('follow_private'))
            entityuser = models.EntityUser.objects.get_or_create(
                user_id=request.user.id, entity_id=entity.id)
            if membership == 1:
                entityuser[0].request = True
                entityuser[0].save()
            else:
                entityuser[0].request = False
                entityuser[0].is_member = False
                entityuser[0].save()
    else:
        entityuser = models.EntityUser.objects.filter(
                user_id=request.user.id, entity_id=entity.id)
    categories_ids = list()
    for ele in categories:
        categories_ids.append(ele.category_id)
    entity_type = models.Type.objects.get(
        entity__id=entity.id)
    users = models.User.objects.filter(
        entityuser__entity__id=entity.id)
    owner = models.User.objects.get(
        id=entity.user_id)
    profile = models.Profile.objects.get(
        user_id=owner.id)
    entities = models.Entity.objects.filter(
        type_id=entity_type.id,
        entitycategory__category_id__in=categories_ids).exclude(
            id=entity.id).distinct()
    followers_list = list()
    entity_followers = models.User.objects.filter(
        entityuser__is_member=1, entityuser__entity_id=entity.id)
    user_pictures = list()
    for follower in entity_followers:
        profile = models.Profile.objects.get(
            user_id=follower.id)
        user_pictures.append(profile.picture)
    entity_admins = models.User.objects.filter(
        entityuser__is_admin=1, entityuser__entity_id=entity.id)
    admins = User.objects.filter(id=entity_admins)

    for ent in entities:
        followers = models.EntityUser.objects.filter(
            entity_id=ent.id)
        followers_list.append(len(followers))

    user = request.user
    rate = account_models.Rate.objects.filter(element_id=id_entity, user=user)
    count_rate = account_models.Rate.objects.filter(element_id=id_entity)
    grade = 0
    grade_rate = 0
    if len(rate) > 0:
        grade = rate[0].grade

    count = 0
    count_grade = 0
    if len(count_rate) > 0:
        for obj in count_rate:
            count = count + obj.grade
        count_grade = Decimal(Decimal(count)/(len(count_rate)))

        grade_rate = int(round(count_grade, 0))
    events = models.Event.objects.all()
    events_months = []
    for event in events:
        # Event date = Month, day, id
        event_date = list()
        event_date.append(event.start_time.month)
        event_date.append(event.start_time.day)
        event_date.append(int(event.id))
        events_months.append(event_date)
    hc = calendar.HTMLCalendar(calendar.MONDAY)
    hc = hc.formatyear(datetime.datetime.now().year)
    hc = hc.replace('Sun', 'D')
    hc = hc.replace('Mon', 'L')
    hc = hc.replace('Tue', 'M')
    hc = hc.replace('Wed', 'M')
    hc = hc.replace('Thu', 'J')
    hc = hc.replace('Fri', 'V')
    hc = hc.replace('Sat', 'S')

    if entity_type.name == 'group':
        entity_type = ['grupos', 'group', 'grupo']
    elif entity_type.name == 'organization':
        entity_type = ['organizaciones', 'organization', 'organizacion']
    elif entity_type.name == 'spot':
        entity_type = ['spots', 'spot']
    html_parser = HTMLParser.HTMLParser()
    unescaped = html_parser.unescape(hc)

    if not entityuser:
        member = False
    else:
        member = entityuser[0].is_member

    entity.address = entity.address.split('#')
    context = {
        'entity': entity,
        'calendar': unescaped,
        'entity_type': entity_type,
        'owner': owner,
        'profile': profile,
        'similar_entities': zip(entities, followers_list),
        'member': member,
        'grade': grade,
        'grade_rate': grade_rate,
        'range': range(5),
        'count': len(count_rate),
        'count_grade': count_grade,
        'followers': zip(entity_followers, user_pictures),
        'admins': admins
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
            if request.POST.get('id_entity') != None:
                if int(request.POST['id_entity']) != -1:
                    events_ = models.Event.objects.filter(location_id=request.
                    POST['id_entity'], status=status)

        events = []
        for event in events_:
            # Event date = Month, day, id
            event_date = list()
            event_date.append(event.start_time.month)
            event_date.append(event.start_time.day)
            event_date.append(int(event.id))
            events.append(event_date)


    if int(request.POST.get('curr_month')) != -1:
        if int(entity) != -1:
            events_ = models.Event.objects.filter(
                start_time__month=int(request.POST.get('curr_month'))+1,
                location_id=int(entity), status=status).order_by('start_time')
        else:
            events_ = models.Event.objects.filter(status=status,
                start_time__month=int(request.POST.get(
                    'curr_month'))+1).order_by('start_time')


            if int(request.POST.get('curr_month')) == 100:
                events_ = models.Event.objects.filter(status=status, name__icontains=request.POST['field_search'])

            if request.POST.get('id_entity') != None:
                if int(request.POST['id_entity']) != -1:
                    events_ = models.Event.objects.filter(status=status,
                        location_id =request.POST['id_entity'])

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
            events.append(event_data)
    context = {
        'events': list(events)
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def event_view(request,**kwargs):

    template = kwargs['template_name']
    entity = kwargs['event_id']
    id_event = int(entity)
    event = Event.objects.get(id=id_event)
    arraymonth = ('Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                'Agosto','Septiembre','Octubre','Noviembre','Diciembre')
    arrayday = ('Lunes','Martes','Miercoles','Jueves','Viernes',
                    'Sabado','Domingo')

    weekday = arrayday[event.start_time.weekday()]
    month = arraymonth[event.start_time.month-1]
    day = event.start_time.day
    year = event.start_time.year
    lat = event.location.lat
    lon = event.location.long

    list_events = models.Event.objects.filter(owner=event.owner)

    date = {'weekday':weekday,'day':day,'month':month,'year':year}

    context = {'event':event,
               'date':date,'lat':lat,'lon':lon,
               'list_event':list_events}

    if 'post' in request.POST:
        context = simplejson.dumps(context)
        return HttpResponse(context, mimetype='application/json')

    return render(request, template, context)


def event(request, **kwargs):

    template = kwargs['template_name']
    context = {'entity_type':'Event'}
    events = models.Event.objects.all()
    events_months = []
    for event in events:
        # Event date = Month, day, id
        event_date = []
        event_date.append(event.start_time.month)
        event_date.append(event.start_time.day)
        event_date.append(int(event.id))
        events_months.append(event_date)
    hc = calendar.HTMLCalendar(calendar.SUNDAY)
    hc = hc.formatyear(datetime.datetime.now().year)
    hc = hc.replace('Sun', 'D')
    hc = hc.replace('Mon', 'L')
    hc = hc.replace('Tue', 'M')
    hc = hc.replace('Wed', 'M')
    hc = hc.replace('Thu', 'J')
    hc = hc.replace('Fri', 'V')
    hc = hc.replace('Sat', 'S')
    hc = hc.replace('January', 'Enero')
    hc = hc.replace('February', 'Febrero')
    hc = hc.replace('March', 'Marzo')
    hc = hc.replace('April', 'Abril')
    hc = hc.replace('May', 'Mayo')
    hc = hc.replace('June', 'Junio')
    hc = hc.replace('July', 'Julio')
    hc = hc.replace('August', 'Agosto')
    hc = hc.replace('September', 'Septiembre')
    hc = hc.replace('October', 'Octubre')
    hc = hc.replace('November', 'Noviembre')
    hc = hc.replace('December', 'Diciembre')


    html_parser = HTMLParser.HTMLParser()
    unescaped = html_parser.unescape(hc)

    context = {
        'entity_type': 'Event',
        'entity': 'wime',
        'calendar': unescaped
    }

    return render(request, template, context)

@login_required(login_url='/')
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
                        print latitude
                        print obj.lat
                        lat = float(obj.lat)
                        lng = float(obj.long)
                        radius = float( 6371 * math.acos( math.cos( math.radians(latitude) ) * math.cos( math.radians( lat ) ) * math.cos( math.radians( lng ) - math.radians(longitude) ) + math.sin( math.radians(latitude) ) * math.sin( math.radians( lat ) ) ) )
                        print radius
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

                    if model_name == 'rate':
                        q_list.append(('type__in', activity))
                    print q_list
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



def get_list(request,**kwargs):
    template = kwargs['template_name']

    type = ['listas', 'list']
    user = request.user
    list = account_models.List.objects.filter(default_type=-1,status=True)

    if request.POST.get('field_value')!=None:
        search = request.POST['field_value']
        if int(request.POST.get('type_list')) == 1:
            list = account_models.List.objects.filter(name__icontains=search, default_type=-1,
                                          status=True)
        else:
            list = account_models.List.objects.filter(name__icontains=search, default_type=-1,
                                          status=True, user=user)

    content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. ' \
                  'Aenean ultricies mi vitae est. Mauris placerat eleifend leo.' \
                  ' Quisque sit amet est et sapien ullamcorper pharetra. ' \
                  'Vestibulum erat wisi, condimentum sed, commodo vitae, ' \
                  'ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt ' \
                  'condimentum, eros ipsum rutrum orci, sagittis tempus lacus ' \
                  'enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. ' \
                  'Praesent dapibus, neque id cursus faucibus, tortor neque ' \
                  'egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. ' \
                  'Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'


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
        print dictionary

    context = {
        'list':dictionary,
        'content':content,
        'type':type
    }


    if request.POST.get('field_value')!=None:
        context = simplejson.dumps(dictionary)
        return HttpResponse(context, mimetype='application/json')

    return render(request, template, context)


def get_titles(request,**kwargs):
    template = kwargs['template_name']

    type = ['Titulos', 'Title']
    dict_items = {}
    book = account_models.Title.objects.all()

    if request.POST.get('field_value')!=None:
        search = request.POST['field_value']
        book = account_models.Title.objects.filter(title__icontains=search)

    content = 'Pellentesque habitant morbi tristique senectus et ' \
                  'netus et malesuada fames ac turpis egestas. Vestibulum ' \
                  'tortor quam, feugiat vitae, ultricies eget, tempor sit ' \
                  'amet, ante. Donec eu libero sit amet quam egestas semper. ' \
                  'Aenean ultricies mi vitae est. Mauris placerat eleifend leo.' \
                  ' Quisque sit amet est et sapien ullamcorper pharetra. ' \
                  'Vestibulum erat wisi, condimentum sed, commodo vitae, ' \
                  'ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt ' \
                  'condimentum, eros ipsum rutrum orci, sagittis tempus lacus ' \
                  'enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. ' \
                  'Praesent dapibus, neque id cursus faucibus, tortor neque ' \
                  'egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. ' \
                  'Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'

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

        author_name = 'autor anonimo'
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
                  'amet, ante. Donec eu libero sit amet quam egestas semper. ' \
                  'Aenean ultricies mi vitae est. Mauris placerat eleifend leo.' \
                  ' Quisque sit amet est et sapien ullamcorper pharetra. ' \
                  'Vestibulum erat wisi, condimentum sed, commodo vitae, ' \
                  'ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt ' \
                  'condimentum, eros ipsum rutrum orci, sagittis tempus lacus ' \
                  'enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. ' \
                  'Praesent dapibus, neque id cursus faucibus, tortor neque ' \
                  'egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. ' \
                  'Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'

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


def get_profile(request, **kwargs):
    template = kwargs['template_name']
    type = kwargs['type']
    profile = kwargs['profile']
    user = request.user
    context = {}
    dict_items = {}
    rate = account_models.Rate.objects.filter(element_id=profile, user=user)
    count_rate = account_models.Rate.objects.filter(element_id=profile)
    list_picture = models.Profile.objects.all()

    if type == 'author':
        profile = account_models.Author.objects.get(id=profile)
        list = account_models.ListAuthor.objects.filter(author=profile, list__status=True)
        list_titles = account_models.AuthorTitle.objects.filter(author=profile)
        grade = 0
        grade_rate = 0
        if len(rate) > 0:
            grade = rate[0].grade

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

            author_name = 'autor anonimo'

            author =  account_models.AuthorTitle.objects.filter(title=obj.title)

            if len(author) != 0:
                author_name = author[0].author.name

            items['author'] = author_name
            items['grade'] = grade_title
            dict_items[int(obj.title.id)] = items

        count = 0
        count_grade = 0
        if len(count_rate) > 0:
            for obj in count_rate:
                count = count + obj.grade
            count_grade = Decimal(Decimal(count)/(len(count_rate)))
            grade_rate = int(round(count_grade,0))

        context = {
            'list_titles':dict_items,
            'list':list,
            'count':len(list_titles),
            'grade':grade,
            'grade_rate':grade_rate,
            'range':range(5),
            'count_vot':len(count_rate),
            'count_grade':count_grade,
        }

    if type == 'title':
        profile = account_models.Title.objects.get(id=profile)
        list_user = account_models.ListTitle.objects.filter(list__default_type=1,
                                                          title=profile, list__status=True,                                                          )
        list = account_models.ListTitle.objects.filter(title=profile, list__status=True,
                                                       list__default_type=-1)
        author = account_models.AuthorTitle.objects.filter(title=profile)

        name_author = 'autor anonimo'
        id_author = 0
        if len(author) != 0:
            name_author = author[0].author.name
            id_author = author[0].author.id

        count = len(list_user)
        grade = 0
        grade_rate = 0
        if len(rate) > 0:
            grade = rate[0].grade

        count = 0
        count_grade = 0
        if len(count_rate) > 0:
            for obj in count_rate:
                count = count + obj.grade
            count_grade = Decimal(Decimal(count)/(len(count_rate)))
            grade_rate = int(round(count_grade,0))

        context = {
            'list_user':list_user,
            'list':list,
            'count':len(list_user),
            'grade':grade,
            'grade_rate':grade_rate,
            'range':range(5),
            'count_vot':len(count_rate),
            'count_grade':count_grade,
            'list_picture':list_picture,
            'name_author':name_author,
            'id_author':id_author
        }


    if type == 'list':
        dict_titles = {}
        dict_authors = {}
        profile = account_models.List.objects.get(id=profile)
        list = account_models.List.objects.filter(user=profile.user, default_type=-1,
                                                  status=True)
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

        grade = 0
        grade_rate = 0
        if len(rate) > 0:
            grade = rate[0].grade

        count = 0
        count_grade = 0
        if len(count_rate) > 0:
            for obj in count_rate:
                count = count + obj.grade
            count_grade = Decimal(Decimal(count)/(len(count_rate)))
            grade_rate = int(round(count_grade,0))

        context = {
            'titles':dict_titles,
            'authors':dict_authors,
            'list':list,
            'grade':grade,
            'grade_rate':grade_rate,
            'range':range(5),
            'count_vot':len(count_rate),
            'count_grade':count_grade
        }


    context['type'] = type
    context['profile'] = profile

    return render(request, template, context)


def search_api(request, **kwargs):
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


def load_picture_profile(request):

    user = request.user

    profile = models.Profile.objects.get(user=user)
    picture = ''
    if profile.picture:
        picture = profile.picture
    context = {
        'id_user':user.id,
        'picture': picture
    }

    context = simplejson.dumps(context)
    return HttpResponse(context, mimetype='application/json')


def get_page(request, **kwargs):

    template = kwargs['template_name']
    page_id = kwargs['page_id']
    user_id = kwargs['user_id']
    page = account_models.Page.objects.get(id=page_id)
    list_pages = account_models.Page.objects.filter(id_user__id=user_id).\
        exclude(id=page_id)
    profile = models.Profile.objects.get(user__id=user_id)
    context = {
        'page':page,
        'list_pages':list_pages,
        'type':'page',
        'profile':profile
    }

    return render(request, template, context)
