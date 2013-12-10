from django.conf.urls import patterns, include, url

from account import views as auth
from course import views

urlpatterns = patterns('',
    url(r'^$',views.get_courses,
        {'template_name': 'course/courses.html'}, name='courses'),
    url(r'course/(?P<id_course>[0-9]+)/$',views.get_course,
        {'template_name': 'course/course.html'}, name='course'),
    url(r'test/(?P<id_test>[0-9]+)/$',views.get_test,
        {'template_name': 'course/test.html'}, name='test'),
    url(r'content/(?P<id_content>[0-9]+)/$',views.get_content,
        {'template_name': 'course/content.html'}, name='content'),
    url(r'remove/$',views.eliminate_course, name='remove_course'),
    url(r'update_position/$',views.update_position, name='update_course_position'),
    url(r'register_course/$',views.register_course,
        {'template_name': 'course/register_course.html'}, name='register_curse'),
    url(r'create_object/$',views.create_object, name='create_object'),
    url(r'grade_test/$',views.grade_test, name='grade_test'),
)