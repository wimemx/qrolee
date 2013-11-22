# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.db import models as db_model

from course import models
from registry import models as registry
from account import models as account

def get_courses(request, **kwargs):

    template = kwargs['template_name']
    courses = models.Course.objects.all()
    list_courses = {}
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
    courses = models.Course.objects.all()
    courser = models.Course.objects.get(id=id_course)
    modules = models.Module.objects.filter(course=courser)
    rate = account.Rate.objects.filter(element_id=courser.id, type='C').\
                values('element_id').annotate(count = db_model.Count('element_id'), score = db_model.Avg('grade'))
    my_rate = account.Rate.objects.filter(user=user, element_id=courser.id,
                                              type='C')

    by = ''
    if courser.type == 'U':
        by = user.first_name
    else:
        entity = registry.Entity.objects.get(id=courser.type_id)
        by = entity.name

    count_vot = 0
    count_rate = 0
    my_vot = 0
    if len(rate) > 0:
        count_vot = rate[0]['count']
        count_rate = rate[0]['score']
    if len(my_rate) > 0:
            my_vot = my_rate[0].grade

    dict_content = {}
    for obj in modules:
        content = models.Content.objects.filter(module=obj)
        value = {
            'module': obj,
            'content': content
        }
        dict_content[obj.id] = value


    context = {
        'courses': courses,
        'course': courser,
        'my_grade': len(my_rate),
        'count_rate': count_rate,
        'my_vot': my_vot,
        'count_vot': count_vot,
        'by': by,
        'modules': dict_content
    }

    return render(request, template, context)


def dict_courses(courses, user):

    list_courses = {}
    for obj in courses:
        modules = models.Module.objects.filter(course=obj)
        user_course = False

        if obj.type == 'U' and obj.type_id == user.id :
            user_course = True
        elif obj.type == 'E':
            entity = registry.Entity.objects.get(id=obj.type_id)
            if entity.user.id == user.id:
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

    context = {
        'content': content,
        'contents': contents
    }

    return render(request, template, context)
