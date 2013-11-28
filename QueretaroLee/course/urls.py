from django.conf.urls import patterns, include, url

from account import views as auth
from course import views

urlpatterns = patterns('',
    url(r'^$',views.get_courses,
        {'template_name': 'course/courses.html'}, name='courses'),
    url(r'course/(?P<id_course>[0-9]+)/$',views.get_course,
        {'template_name': 'course/course.html'}, name='course'),
    url(r'content/(?P<id_content>[0-9]+)/$',views.get_content,
        {'template_name': 'course/content.html'}, name='content'),
    url(r'register_course/$',views.register_course,
        {'template_name': 'course/register_course.html'}, name='register_curse'),


)