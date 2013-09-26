from registry import models
from account import models as account
from django.db.models import signals

def create_default_type(app, created_models, verbosity, **kwargs):
    print 'creating default type'
    type_org = models.Type.objects.create(name='group',
                                      description='text')
    type_org.save()
    type_group = models.Type.objects.create(name='organization',
                                      description='text')
    type_org.save()
    type_spot = models.Type.objects.create(name='spot',
                                      description='text')
    type_spot.save()
    category_org = models.Category.objects.create(name='Cultural',
                                              type=type_org)
    category_org.save()
    category_group = models.Category.objects.create(name='Lectura',
                                              type=type_group)
    category_group.save()
    category_spot = models.Category.objects.create(name='Cafe',
                                              type=type_spot)
    category_spot.save()


def create_default_genre(app, created_models, verbosity, **kwargs):
    list = {
        'name':'comedia',
        'description':'text'
            }
    #genre = account.Genre.objects.create(**)
    #genre.save()

signals.post_syncdb.connect(create_default_type, sender=models)