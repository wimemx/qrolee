from django.conf.urls import patterns, include, url

from registry import views

urlpatterns = patterns('',
    url(r'^login/$', views.login ,
        name='login'),
    url(r'^logout/$', views.logout ,
        name='logout'),
    url(r'^account_register/$', views.account_register ,
        name='register'),
    url(r'^register_entity/(?P<entity_type>\w+)/$', views.register_entity ,
        { 'template_name': 'registry/register_entity.html' },
        name='register_entity'),
    url(r'^register_event/(?P<entity_type>\w+)/(?P<entity_id>[0-9]+)/$', views.register_event ,
        { 'template_name': 'registry/register_event.html' },
        name='register_event'),
    url(r'^register/$', views.register ,
        name='ajax_register_entity'),
    url(r'^setup/$', views.register_menu ,
        { 'template_name': 'registry/register_menu.html' },
        name='register_menu'),
    url(r'^edit/events/(?P<entity>[a-zA-Z0-9_]+)/$', views.event ,
        { 'template_name': 'registry/event.html' },
        name='edit_events'),
    url(r'^edit/event/(?P<entity>[a-zA-Z0-9_]+)/$', views.edit_event,
        { 'template_name': 'registry/edit_event.html' },
        name='edit_event'),
    url(r'delete/(?P<entity_type>[a-zA-Z0-9]+)/(?P<entity>[a-zA-Z0-9_]+)/$', views.delete_entity ,
        name='edit_entity'),
    url(r'^edit/(?P<entity>[a-zA-Z0-9_]+)/$', views.edit_entity ,
        { 'template_name': 'registry/edit_entity.html' },
        name='edit_entity'),
    url(r'^update/(?P<entity_id>[0-9]+)/$', views.update_entity ,
        name='update_entity'),
    url(r'^media/upload/$', views.media_upload ,
        name='ajax_register_entity'),
    url(r'^register/event/$', views.ajax_register_event ,
        name='ajax_register_event'),
    url(r'^admin_users/(?P<entity>[a-zA-Z0-9_]+)/$', views.admin_users ,
        { 'template_name': 'registry/admin_users.html' },
        name='administrate_users'),
    url(r'^remove_add_user/(?P<user_id>[a-zA-Z@0-9_\-\.]+)/$', views.remove_add_user ,
        name='remove_user'),
    url(r'^join_entity/(?P<entity>[a-zA-Z0-9_]+)/$', views.join_entity,
        name='join_entity'),
    url(r'^unjoin_entity/(?P<entity>[a-zA-Z0-9_]+)/$', views.unjoin_entity,
        name='unjoin_entity'),
    url(r'^register_list/', views.registry_list ,
        { 'template_name': 'registry/registry_list.html' },
        name='registry_list'),
    url(r'^register_ajax_list/', views.register_ajax_list,
        name='registry_ajax_list'),
    url(r'^add_genre/', views.add_genre, name='add_genre'),
    url(r'^delete_title/', views.delete_title, name='delete_title'),
    url(r'^delete_list/', views.delete_list, name='delete_list'),
    url(r'^add_rate/', views.add_rate, name='rate'),
    url(r'^add_my_title/', views.add_my_title, name='add_my_title'),
    url(r'^add_titles_my_list/', views.add_titles_author_list, name='add_title_author_list'),
    url(r'^edit_list/(?P<type_list>\w+)/(?P<id_list>[0-9]+)/$',views.edit_list,
        { 'template_name': 'registry/edit_list.html' }, name='edit_list'),
    url(r'^update_list/(?P<list_id>[0-9]+)/$', views.update_list,
    name='update_list'),
    url(r'^edit_title_read/', views.edit_title_read, name='edit_title_read'),
)