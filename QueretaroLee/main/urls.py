from django.conf.urls import patterns, include, url

from main import views

urlpatterns = patterns('',
    url(r'^$', views.index , { 'template_name':'main/index.html' },
        name='index'),
    url(r'entities/(?P<entity_type>[a-z]+)/$',views.get_entities,
        {'template_name': 'main/entities.html'}, name='entities'),
    url(r'entity/events/(?P<entity_id>[0-9-]+)/$',views.get_events,
        name='entity'),
    url(r'entity/(?P<entity_type>[a-zA-Z0-9]+)/(?P<entity>[-\w_]+)/$',views.get_entity,
        {'template_name': 'main/entity.html' }, name='entity'),
    url(r'^events/(?P<event_id>[-\w]+)/$', views.event_view ,
        {'template_name': 'main/event_view.html'}, name='event_view'),
    url(r'^events/$', views.event ,
        {'template_name': 'main/event.html'}, name='event'),
    url(r'^list/', views.get_list ,
        {'template_name': 'main/list.html'}, name='list'),
    url(r'^book/titles/', views.get_titles ,
        {'template_name': 'main/list.html'}, name='title'),
    url(r'^book/authors/', views.get_authors ,
        {'template_name': 'main/list.html'}, name='list_author'),
    url(r'^list_genre/', views.get_genre, name='list_genre'),
    url(r'^profile/(?P<type>[a-z]+)/(?P<profile>[0-9]+)/$', views.get_profile ,
        {'template_name': 'main/profile_ta.html'}, name='author'),
    url(r'^advanced_search/$', views.advanced_search ,
        {'template_name': 'main/advanced_search.html'},name='advanced_search'),
    url(r'^search_api/$', views.search_api ,name='search_api'),
    url(r'^load_picture/$', views.load_picture_profile ,name='load_picture_profile'),
    url(r'^user/(?P<user_id>[0-9]+)/page/(?P<page_id>[0-9]+)/$', views.get_page ,
        {'template_name': 'main/page.html'},name='page'),
    url(r'^book_crossing/$', views.book_crossing ,
        {'template_name': 'main/book_crossing.html'},name='book_crossing'),


)