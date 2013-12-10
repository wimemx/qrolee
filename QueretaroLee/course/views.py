# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.db import models as db_model
from django.db.models.loading import get_model
from django.contrib.auth.models import  User

from course import models
from registry import models as registry, settings
from account import models as account

import json
import ast
import pprint


def get_courses(request, **kwargs):

    template = kwargs['template_name']
    courses = models.Course.objects.filter(status=True)
    user = request.user
    list_courses = dict_courses(courses, user)

    context = {
        'courses': list_courses
    }

    return render(request, template, context)


def get_course(request, **kwargs):

    template = kwargs['template_name']
    id_course = kwargs['id_course']
    user = request.user
    courses = models.Course.objects.filter(status=True)
    courser = models.Course.objects.get(id=id_course, status=True)
    modules = models.Module.objects.filter(course=courser, status=True).order_by('order')
    rate = account.Rate.objects.filter(
        element_id=courser.id, type='C').values('element_id').annotate(
            count=db_model.Count('element_id'), score=db_model.Avg('grade'))
    my_rate = account.Rate.objects.filter(
        user=user, element_id=courser.id, type='C')

    if courser.type == 'U':
        by = user.first_name
    else:
        entity = registry.Entity.objects.get(id=courser.type_pk)
        by = entity.name

    owner = False
    if courser.type == 'U' and courser.type_pk == request.user.id:
            owner = True
    elif courser.type == 'E':
        entity = registry.Entity.objects.get(id=courser.type_pk)
        admins = registry.MemberToObject.objects.filter(
            is_admin=True, object_type='E', object=entity.id)
        admins_list = list()
        for a in admins:
            admins_list.append(a.user_id)
        match = 0
        for ele in admins_list:
            if user.id == ele:
                match += 1

        if match != 0:
            owner = True

    count_vot = 0
    count_rate = 0
    my_vot = 0
    if len(rate) > 0:
        count_vot = rate[0]['count']
        count_rate = rate[0]['score']
    if len(my_rate) > 0:
            my_vot = my_rate[0].grade

    dict_content = {}
    list_content = list()
    for obj in modules:
        content = models.Content.objects.filter(module=obj, status=True).order_by('order')
        value = {
            'module': obj,
            'content': content,
            'key': obj.id
        }
        list_content.append(value)

    context = {
        'courses': courses,
        'course': courser,
        'my_grade': len(my_rate),
        'count_rate': count_rate,
        'my_vot': my_vot,
        'count_vot': count_vot,
        'by': by,
        'list_modules': list_content,
        'owner': owner,
        'site_url': settings.SITE_URL
    }

    return render(request, template, context)


def dict_courses(courses, user):

    list_courses = {}
    for obj in courses:
        modules = models.Module.objects.filter(course=obj)
        user_course = False

        if obj.type == 'U' and obj.type_pk == user.id:
            user_course = True
        elif obj.type == 'E':
            entity = registry.Entity.objects.get(id=obj.type_pk)
            admins = registry.MemberToObject.objects.filter(
                is_admin=True, object_type='E', object=entity.id)
            admins_list = list()
            for a in admins:
                admins_list.append(a.user_id)
            match = 0
            for ele in admins_list:
                if user.id == ele:
                    match += 1

            if match != 0:
                user_course = True

        rate = account.Rate.objects.filter(
            element_id=obj.id, type='C').values('element_id').annotate(
                count=db_model.Count('element_id'), score=db_model.Avg('grade'))

        if rate:
            rate = rate[0]['score']
        else:
            rate = 0

        value = {
            'course': obj,
            'count_module': len(modules),
            'rate': rate,
            'user_course': user_course
        }

        if not obj.published and user_course or obj.published:
            list_courses[obj.id] = value

    return list_courses


def get_content(request, **kwargs):
    template = kwargs['template_name']
    content = models.Content.objects.get(id=kwargs['id_content'])
    contents = models.Content.objects.filter(module=content.module)

    if content.module.course.type == 'E':
        entity = registry.Entity.objects.get(
            id=content.module.course.type_pk)
        uid = entity.user_id
    else:
        user = User.objects.get(
            id=content.module.course.type_pk)
        uid = user.id

    discussions = account.Discussion.objects.get_or_create(
        object=content.id, type='C', parent_discussion_id__isnull=True, user_id=uid)

    if discussions:
        discussions = discussions[0]
    else:
        discussions = None

    context = {
        'content': content,
        'contents': contents,
        'discussions': discussions
    }

    return render(request, template, context)


def eliminate_course(request):
    obj_id = request.POST.get('id')
    model = request.POST.get('model')
    app = model.split('.')
    app_label = app[0]
    model_name = app[1]
    model = get_model(app_label, model_name)
    object = model.objects.filter(
        id=obj_id)
    if object:
        object = object[0]
        object.status = 0
        object.save()
        response = 1
    else:
        object = None
        response = 0

    context = {
        'response': response
    }
    context = json.dumps(context)
    return HttpResponse(context, content_type='application/json')


def update_position(request):
    model = request.POST.get('model')
    app = model.split('.')
    app_label = app[0]
    model_name = app[1]
    model = get_model(app_label, model_name)
    elements = ast.literal_eval(request.POST.get('position'))
    position = 0
    for value in elements:
        obj = model.objects.get(id=value)
        obj.order = position
        obj.save()
        position += 1

    context = {
        'response': ''
    }
    context = json.dumps(context)
    return HttpResponse(context, content_type='application/json')


def register_course(request, **kwargs):
    template = kwargs['template_name']
    list_autor = {}
    entities = registry.Entity.objects.all().exclude(status=1)
    users = registry.User.objects.all().exclude(is_staff=1, is_active=0)

    for obj in entities:
        list_autor[obj.id] = {
            'type': 'E',
            'id': obj.id,
            'name': obj.name
        }

    for user in users:
        name = user.first_name
        if not user.first_name:
            name = user.username

        list_autor[user.id] = {
            'type': 'U',
            'id': user.id,
            'name': name
        }

    context = {
        'list_autor': list_autor
    }

    return render(request, template, context)


def create_object(request):
    print request.POST
    data = """{"course.content":{"1":{"name":"tema 1","text":"<p>text</p>","order":1,"module_id":"","course.module":{"1":{"name":"mod 1","text":"text","order":1,"course_id":"","course.course":{"1":{"name":"example","description":"text","type_pk":1,"type":"E"}}}}},"2":{"name":"tema 1","text":"<p>text</p>","order":1,"module_id":"","course.module":{"1":{"name":"mod 1","text":"text","order":1,"course_id":"","course.course":{"1":{"name":"example","description":"text","type_id":1,"type":"E"}}}}}}}"""
    data = ast.literal_eval(data)
    create_objects(
        data=data['course.content'], model_name='course.content')


def create_objects(data, model_name, id=None):
    # Get the number of parent models to create
    for num_parent_models in data:
        # For each parent model inside get fields
        app = model_name.split('.')
        app_label = app[0]
        app_model_name = app[1]
        model = get_model(app_label, app_model_name)
        data_dict = dict()
        id = -1
        for parent_models_fields, parent_models_values in data[num_parent_models].iteritems():

            if len(parent_models_fields.split('.')) > 1:
                id = create_objects(data=parent_models_values, model_name=parent_models_fields)
            else:
                data_dict[parent_models_fields] = parent_models_values

        if id != -1:
            for parent_models_fields, parent_models_values in data[num_parent_models].iteritems():
                if '_id' in parent_models_fields:
                    data_dict[parent_models_fields] = id

        object = model(**data_dict)
        object.save()
        return object.id


def edit_course(request, **kwargs):
    template = kwargs['template_name']
    list_autor = {}
    entities = registry.Entity.objects.all().exclude(status=1)
    users = registry.User.objects.all().exclude(is_staff=1, is_active=0)
    user = request.user
    id_course = kwargs['id_course']
    rate = account.Rate.objects.filter(
        element_id=id_course, type='C').values('element_id').annotate(
        count=db_model.Count('element_id'), score=db_model.Avg('grade'))
    course = models.Course.objects.filter(id=id_course, status=True)
    modules = models.Module.objects.filter(course=course)
    dict_mod = {}

    for obj in modules:
        content = models.Content.objects.filter(module=obj)
        dict_mod[obj.id] = {
            'module': obj,
            'content': content
        }

    for obj in entities:
        list_autor[obj.id] = {
            'type': 'E',
            'id': obj.id,
            'name': obj.name
        }

    for user in users:
        name = user.first_name
        if not user.first_name:
            name = user.username

        list_autor[user.id] = {
            'type': 'U',
            'id': user.id,
            'name': name
        }

    score = 0
    if rate:
        score = rate[0]['score']
    context = {
        'list_autor': list_autor,
        'course': course,
        'dict_mod': dict_mod,
        'count_rate': score
    }

    return render(request, template, context)