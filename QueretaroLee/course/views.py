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
import simplejson
import ast
import math


def get_courses(request, **kwargs):

    template = kwargs['template_name']
    categories = models.Category.objects.filter(status=True)
    user = request.user
    list_categories = {}

    for obj in categories:
        courses = models.Course.objects.filter(category=obj, status=True)
        list_courses = dict_courses(courses, user)
        list_categories[obj.id] = {
            'category': obj,
            'courses': list_courses
        }

    context = {
        'categories': list_categories
    }

    return render(request, template, context)


def get_course(request, **kwargs):

    template = kwargs['template_name']
    id_course = kwargs['id_course']
    user = request.user
    courses = models.Course.objects.filter(status=True)
    courser = models.Course.objects.get(id=id_course, status=True)
    modules = models.Module.objects.filter(course_dm=courser, status=True).order_by('order')
    rate = account.Rate.objects.filter(
        element_id=courser.id, type='C').values('element_id').annotate(
            count=db_model.Count('element_id'), score=db_model.Avg('grade'))
    my_rate = account.Rate.objects.filter(
        user=user, element_id=courser.id, type='C')

    course_owner = 0

    if courser.type == 'U':
        by = user.first_name
        user = registry.User.objects.get(id=courser.type_pk)
        course_owner = user.id

    else:
        entity = registry.Entity.objects.get(id=courser.type_pk)
        by = entity.name
        course_owner = entity.user.id

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

    list_content = list()
    for obj in modules:
        content = models.Content.objects.filter(module_dm=obj, status=True).order_by('order')
        test = models.Test.objects.filter(module_dm=obj)
        value = {
            'module': obj,
            'content': content,
            'key': obj.id,
            'test': test
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
        'site_url': settings.SITE_URL,
        'course_owner': course_owner
    }

    return render(request, template, context)


def get_test(request, **kwargs):
    template = kwargs['template_name']
    id_course = kwargs['id_test']
    user = request.user
    courser = models.Test.objects.get(id=id_course, status=True)
    courses = models.Course.objects.filter(status=True)
    modules = models.Module.objects.filter(course_dm=courser, status=True).order_by('order')
    owner = False

    list_content = list()
    for obj in modules:
        content = models.Content.objects.filter(module_dm=obj, status=True).order_by('order')
        test = models.Test.objects.filter(module_dm=obj)
        value = {
            'module': obj,
            'content': content,
            'key': obj.id,
            'test': test
        }
        list_content.append(value)

    questions_dict = dict()
    questions = models.Question.objects.filter(test_dm=courser)
    for question in questions:
        options = models.Option.objects.filter(question_dm=question)
        options_dict = dict()
        options_dict['question_id'] = question.id
        for option in options:
            options_dict[option.id] = option
        questions_dict[question.title] = options_dict

    context = {
        'courses': courses,
        'course': courser,
        'list_modules': list_content,
        'owner': owner,
        'site_url': settings.SITE_URL,
        'questions': questions_dict
    }
    return render(request, template, context)


def dict_courses(courses, user):
    print courses
    list_courses = {}
    for obj in courses:
        modules = models.Module.objects.filter(course_dm=obj)

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
    contents = models.Content.objects.filter(module_dm=content.module_dm)

    if content.module_dm.course_dm.type == 'E':
        entity = registry.Entity.objects.get(
            id=content.module_dm.course_dm.type_pk)
        uid = entity.user_id
    else:
        user = User.objects.get(
            id=content.module_dm.course_dm.type_pk)
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
    entities = registry.Entity.objects.filter(status=True, type=2, user = request.user)
    users = registry.User.objects.filter(id=request.user.id).exclude(is_staff=1, is_active=0)
    categories = models.Category.objects.all()

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
        'list_autor': list_autor,
        'categories': categories
    }

    return render(request, template, context)


def create_object(request):
    data = request.POST.get('data')
    data = ast.literal_eval(data)
    create_objects(
        data=data['course.course'], model_name='course.course')

    course = models.Course.objects.all()
    id = 0

    if len(course) == 1:
        id = course[0].id
    else:
        id = course.latest('id').id

    context = {
        'response': 'success',
        'id': id
    }
    context = json.dumps(context)
    return HttpResponse(context, content_type='application/json')


def create_objects(data, model_name, id=None):
    # Get the number of parent models to create
    for num_parent_models in data:


        app = model_name.split('.')
        app_label = app[0]
        app_model_name = app[1]
        model = get_model(app_label, app_model_name)
        data_dict = dict()

        for parent_models_fields, parent_models_values in data[num_parent_models].iteritems():

            if parent_models_fields == 'bd':
                if parent_models_values == 1:
                    obj_exist = model.objects.filter(id=num_parent_models)
                    object = obj_exist[0]
                else:
                    object = model.objects.create(**data_dict)

        inner_id = object.id

        for parent_models_fields, parent_models_values in data[num_parent_models].iteritems():


            if len(parent_models_fields.split('.')) > 1:
                create_objects(data=parent_models_values, model_name=parent_models_fields, id=inner_id)
            else:
                if parent_models_fields != 'bd':
                    data_dict[parent_models_fields] = parent_models_values
        if id != -1:
            for parent_models_fields, parent_models_values in data[num_parent_models].iteritems():
                if '_dm' in parent_models_fields is not None:
                    data_dict[parent_models_fields] = id

        model.objects.filter(id=inner_id).update(**data_dict)

    return 0


def grade_test(request):
    test = models.Test.objects.get(id=request.POST.get('test_id'))
    answers = ast.literal_eval(request.POST.get('answers'))
    questions = models.Question.objects.filter(test_dm=test)
    if int(request.POST.get('question_id')) != -1:
        questions = models.Question.objects.filter(
            id=int(request.POST.get('question_id')))
    correct = 0.0
    total = float(len(questions))
    for a in answers:
        for answer in a:
            answer = int(answer)
            print answer
            if answer != -1:
                option = models.Option.objects.get(
                    id=answer)
                options = models.Option.objects.filter(
                    question_dm=option.question_dm).filter(
                    value__gt=0)

                if len(a) > len(options):
                    correct = 0.0
                    break
                correct += float(option.value)

    final_score = float(correct/total)*100.0
    final_score = math.ceil(final_score)
    context = {
        'response': final_score,
        'correct_set': 'correct_set'
    }
    context = json.dumps(context)
    return HttpResponse(context, content_type='application/json')


def edit_course(request, **kwargs):
    template = kwargs['template_name']
    list_autor = {}
    entities = registry.Entity.objects.filter(status=True, type=2, user = request.user)
    user = request.user
    users = registry.User.objects.filter(id=user.id).exclude(is_staff=1, is_active=0)
    id_course = kwargs['id_course']
    rate = account.Rate.objects.filter(
        element_id=id_course, type='C').values('element_id').annotate(
        count=db_model.Count('element_id'), score=db_model.Avg('grade'))
    course = models.Course.objects.filter(id=id_course, status=True)
    modules = models.Module.objects.filter(course_dm=course, status=True)
    categories = models.Category.objects.all()
    dict_mod = {}
    name_author = ''
    sel_category = 0

    for obj in modules:
        content = models.Content.objects.filter(module_dm__id=obj.id, status=True)
        test = models.Test.objects.filter(module_dm__id=obj.id, status=True)
        dict_test = {}

        for te in test:
            question = models.Question.objects.filter(test_dm__id=te.id, status=True)
            dict_quest = {}

            for ques in question:
                option = models.Option.objects.filter(question_dm__id=ques.id, status=True)
                dict_quest[ques.id] = {
                    'question': ques,
                    'option': option
                }

            dict_test[te.id] = {
                'test': te,
                'question': dict_quest
            }

        dict_mod[obj.id] = {
            'module': obj,
            'content': content,
            'test': dict_test
        }




    for obj in entities:
        list_autor[obj.id] = {
            'type': 'E',
            'id': obj.id,
            'name': obj.name
        }

        if course[0].type_pk  == obj.id and course[0].type == 'E':
            name_author = obj.name

    for us in users:
        name = us.first_name
        if not us.first_name:
            name = us.username

        list_autor[user.id] = {
            'type': 'U',
            'id': us.id,
            'name': name
        }
        if course[0].type_pk == us.id and course[0].type == 'U':
            name_author = name

    score = 0
    if rate:
        score = rate[0]['score']

    context = {
        'list_autor': list_autor,
        'course': course,
        'dict_mod': dict_mod,
        'count_rate': score,
        'categories': categories,
        'name_author': name_author
    }

    return render(request, template, context)


def update_function(request):
    app = request.POST.get('model_name').split('.')
    app_label = app[0]
    model_name = app[1]
    model = get_model(app_label, model_name)

    field = request.POST.get('field')
    value = request.POST.get('value')

    update_dict = {
        field: value
    }

    if(field == 'status'):
        result = model.objects.get(pk=request.POST.get('id'))
        result.status = 0;
        result.save()
    else:
        result = model.objects.filter(pk=request.POST.get('id')).update(**update_dict)


    if result > 0:
        success = ':)'
    else:
        success = ':('

    context = {
        'success': success
    }
    context = simplejson.dumps(context)
    return HttpResponse(context, content_type='application/json')