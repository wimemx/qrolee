from django.conf.urls import patterns, include, url

from account import views as auth
from registry.views import account_register

urlpatterns = patterns('',
    url(r'^login/', auth.login , {'template_name':'auth/login.html'},
        name='login'),
    url(r'^logout/', auth.logout, name='logout'),
    url(r'^users/profile/(?P<id_user>[0-9]+)/$',auth.user_profile ,
        {'template_name': 'users/profile.html'},name='user_view'),
    url(r'^users/edit_profile/(?P<id_user>[0-9]+)/$',auth.user_profile ,
        {'template_name': 'users/edit_user.html'},name='user_profile'),
    url(r'^users/edit_account/$',auth.user_account ,
        {'template_name': 'users/edit_user.html'},name='user_account'),
    url(r'^users/update_profile/$',auth.update_profile ,
        name='update_user'),
    url(r'^users/update_account/$',auth.update_account ,
        name='update_account'),
    url(r'^auth/', auth.login, {'template_name':'auth/login.html'},
        name='auth'),
    url(r'^delete_user/',auth.delete_account,
        name='auth'),
    url(r'^list_users/',auth.list_user,
        name='list_users'),
    url(r'^users/registry_page', auth.registry_page, {'template_name':'users/registry_page.html'},
        name='registry_page'),
    url(r'^users/registry_ajax_page/',auth.registry_ajax_page,
        name='registry_ajax_page'),

)