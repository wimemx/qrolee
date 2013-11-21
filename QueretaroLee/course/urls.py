from django.conf.urls import patterns, include, url

from account import views as auth
from registry.views import account_register

urlpatterns = patterns('',
    url(r'^login/', auth.login , {'template_name':'auth/login.html'},
        name='login'),

)