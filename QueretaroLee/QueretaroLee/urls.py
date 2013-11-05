from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from registry import views

from QueretaroLee import views as qro



urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'QueretaroLee.views.home', name='home'),
    # url(r'^QueretaroLee/', include('QueretaroLee.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.index, {'template_name': 'index.html'}, name='index'),
    url(r'^registry/', include('registry.urls')),
    url(r'^qro_lee/', include('main.urls')),
    url(r'^accounts/', include('account.urls')),
    url(r'^html2pdf/', include('djangoproject.urls')),
    # url(r'^tinymce/', include('tinymce.urls')),
)

