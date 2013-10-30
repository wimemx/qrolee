function truncText (text, maxLength, ellipseText){
        ellipseText = ellipseText || '&hellip;';

        text_ = '';
        if(text.length > maxLength)
            text_ = (text).substring(0,(maxLength-3)) + '...';
        else
            text_ = text;

        /*ellipseText = ellipseText || '&hellip;';

        if (text.length < maxLength)
            return text;

        //Find the last piece of string that contain a series of not A-Za-z0-9_ followed by A-Za-z0-9_ starting from maxLength
        var m = text.substr(0, maxLength).match(/([^A-Za-z0-9_]*)[A-Za-z0-9_]*$/);
        if(!m) return ellipseText;

        //Position of last output character
        var lastCharPosition = maxLength-m[0].length;

        //If it is a space or "[" or "(" or "{" then stop one before.
        if(/[\s\(\[\{]/.test(text[lastCharPosition])) lastCharPosition--;

        //Make sure we do not just return a letter..
        return (lastCharPosition ? text.substr(0, lastCharPosition+1) : '') + ellipseText;*/
        return text_;
}

function populateCal(curr_month,$item){
    $('.item').remove();
    $('.d-not_found').remove();
    if((curr_month)>=0){

        var url = '/qro_lee/entity/events/' + $('.sidebar-b input.entity').val()+'/';

        var edit_events;
        if($('.id_entity').val()==undefined){
            edit_events = -1;
        }else{
            edit_events = $('.id_entity').val();
        }
        $.ajax({
            type: "POST",
            url: url,
            data: {
                'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                'curr_month': curr_month,
                'field_search':$('.d_field_search').val(),
                'id_entity':edit_events

            },
            dataType: 'json'
        }).done(function(data){
                var counter = 0;
                $.each(data,function(index){
                    var event = data[index];
                    var length = event.length;
                    $.each(event,function(i){
                        var $ditem = $item.clone();
                        var e = event[i];
                        //Event name, day#,Week num ex Mon, picture,description, time, id, user_id
                        $ditem.removeClass().addClass('item item_'+i);

                        var picture_url = window.location.origin+'/static/media/users/'+
                            e[8]+'/event/'+e[3];
                        if(e[3] == '')
                            picture_url = '/static/img/create.png';
                        var d_name = e[0];
                        d_name = d_name.replace(/\s/g,'');
                        var href = '/qro_lee/events/' + e[6];

                        span_item = $('<span class="item item_'+i+'"></span>');
                        span_lin = $('<span class="grid-6 no-margin"></span>');
                        span_date = $('<span class="date fright din-m day_15"></span>');
                        span_date.html(days[e[2]-1]+' '+e[1]);
                        span_date.addClass('day_'+e[1]);
                        span_ = $('<span class="ruler grid-5 fright"></span>');
                        span_lin.append(span_date);
                        span_lin.append(span_);
                        span_item.append(span_lin);
                        span_wrap = $('<span class="wrapper fleft"></span>');
                        a = $('<a class="d-link_event" href="'+href+'" ></a>');
                        img = $('<img class="profile-picture" />');
                        img.attr('src',picture_url);
                        a.append(img);
                        span_wrap.append(a);
                        span_item.append(span_wrap);
                        span_text = $('<span class="grid-7 fleft no-margin"></span>');
                        a_2 = $('<a class="d-link_event" href="'+href+'" ><h3>'+e[0]+'</h3></a>');
                        p = $('<p></p>');
                        span_info = $('<span class="info grid-6 alpha">'+truncText(e[4],160)+'</span>');
                        p.append(span_info);
                        span_time = $('<span class="time fleft">'+e[5]+'</span>');
                        span_text.append(a_2);
                        span_text.append(p);
                        span_text.append(span_time);
                        span_locat = $('<span class="location fright"><span>');
                        p_2 = $('<p></p>');
                        var loc = e[7].split('-');
                        var location_name = loc[0].split("#");
                        span_place_1 = $('<span class="place">'+truncText(location_name[0],30)+'</span><br>');
                        p_2.append(span_place_1);
                        if(location_name.length>1){
                            span_place_2 = $('<span class="place2">'+truncText(location_name[1],30)+'</span>');
                            p_2.append(span_place_2);
                        }
                        span_apply = $('<span class="apply fright">asistir</span>');
                        span_locat.append(p_2);
                        span_locat.append(span_apply);
                        span_text.append(span_locat);
                        span_item.append(span_lin);
                        span_item.append(span_wrap);
                        span_item.append(span_text);
                        $('.d-width-container-event').append(span_item);

                        /*if($ditem.hasClass('item_'+i)){
                            $ditem.find('.date').html(days[e[2]-1]+' '+e[1]);
                            $ditem.find('.date').addClass('day_'+e[1]);
                            var picture_url = window.location.origin+'/static/media/users/'+
                                e[8]+'/event/'+e[3];
                            if(e[3] == '')
                                picture_url = '/static/img/create.png';
                            var d_name = e[0];
                            d_name = d_name.replace(/\s/g,'');
                            $ditem.find('.d-link_event').attr('href','/qro_lee/events/'
                                + e[6]);
                            $ditem.find('.profile-picture').attr('src',picture_url);
                            $ditem.find('.title').html(e[0]);
                            $ditem.find('.time').html(e[5]);
                            $ditem.find('.info').html(truncText(e[4],160));
                            var loc = e[7].split('-');
                            $ditem.find('.location p span').html(loc[1]);
                            var location_name = loc[0].split("#");
                            $ditem.find('.place').html(truncText(location_name[0],30));
                            if(location_name.length>1){
                                $ditem.find('.place2').html(truncText(location_name[1],30));
                            }
                            $('.sidebar-a .overview').append($ditem);
                            var name = e[0].split(' ');
                            var edit_url = '/registry/edit/event/'+e[6];
                            if($ditem.find('.green_btn').length > 0){
                                $ditem.find('.date').html(e[1]+' de '+months[e[9]-1]);
                                $ditem.find('.green_btn').attr('href', edit_url);
                            }
                        }*/

                        if((counter+1) == length){
                            $('.sidebar-a .overview *[class*="item_"]').fadeIn(300,function(){


                            }).css('display','block');
                        }

                        counter++;
                    });
                });
                if(counter==0){
                    text_no_found('eventos para este mes');
                }
                $('.scroll_events').tinyscrollbar();
            });
    }
}


var len = 0;
var counter = 1;
function removeUser($ele,user_id, remove, entity){

    $.ajax({
        type: "POST",
        url: '/registry/remove_add_user/'+user_id+'/',
        dataType: 'json',
        data: {
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
            'user_id': user_id,
            'remove': remove,
            'entity': entity
        }
    }).done(function(data) {


    });
}

function findUser($ele, userEmail, entity, $parent){

    $item = $parent.find('.affiliate').clone();
    $.ajax({
        type: "POST",
        url: '/registry/remove_add_user/'+userEmail+'/',
        dataType: 'json',
        data: {
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
            'user_email': userEmail,
            'entity': entity
        }
    }).done(function(data) {
            $.each(data,function(index){
                var user = data[index];
                $.each(user,function(i){
                    var span = $item.clone();
                    span.removeClass('affiliate margin').addClass('affiliate user_'+user[i][1]);
                    if(span.hasClass('user_'+user[i][1])){
                        var img_url;
                        if(user[i][0])
                            img_url = '/static/media/users/'+user[i][1]+'/profile/'+user[i][0];
                        else
                            img_url = '/static/img/create.png';
                        span.find('.name').html(user[i][2]);
                        span.find('.user-id').val(user[i][1]);
                        span.find('img').attr('src',img_url);
                        span.find('.since').html('Se únio hace '+user[i][3]+' meses');
                        span.appendTo($parent);
                        span.fadeIn(300);
                        if(user[i][4])
                            span.find('.remove').remove();
                    }
                });

            });
           var counter = 2;
           $parent.find('.affiliate').each(function(i){
                if(i == counter){
                    $(this).addClass('margin');
                    counter += 3;
                }
               $(this).find('.green_btn').click(function(){
                   $(this).fadeOut(300,function(){
                       $(this).parent().parent().find('.remove').fadeIn(300);
                   });
                   removeUser($('.alert-message'),
                       $(this).parent().parent().find('.user-id').val(), 0,
                       $('.alert-message input.entity').val());
                   if($(this).parent().parent().parent().hasClass('request')){
                       $this = $(this).parent().parent();
                       var user = $this.find('input.user-id').val();

                        $('.affiliate').each(function(index){
                            $(this).removeClass('margin');
                            if($(this).hasClass('user_'+user)){
                                $(this).fadeOut(300,function(){
                                    $(this).remove();
                                    $('.affiliate').each(function(i){
                                        if(i == counter){
                                            $(this).addClass('margin');
                                            counter += 3;
                                        }
                                    });
                                });
                            }

                        });
                   }
               });
               $(this).find('.remove').click(function(){
                   if(!$(this).hasClass('add')){
                       var user = $(this).parent().parent().find('input').val();
                       var name = $(this).parent().find('.name').html();
                       $('.container_message').fadeIn(300,function(){
                           $(this).find('.name').html(name);
                           $(this).find('.user').val(user);
                       });
                       counter = 1;
                       len = $('.affiliate').length;
                   }
               });
           });

    });
}

function update_obj(field, value, $this){
    $.ajax({
                type: "POST",
                url: '/registry/update/'+$('input.entity').val()+'/',
                data: {
                    'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                    'field': field,
                    'value': value
                },
                dataType: 'json'
                }).done(function(data){
                if($this){
                    if($this.parent().find('input.value').length > 0)
                        $this.parent().find('span.value').html($this.parent().find('input.value').val());
                    else if($this.parent().find('textarea.value').length > 0)
                        $this.parent().find('span.value').html($this.parent().find('textarea.value').val());
                    else
                        $this.parent().find('span.value').html($this.parent().find('select.value').val());
                    $this.parent().find('.close').fadeOut(300,function(){
                    $this.fadeOut(300,function(){
                            $this.parent().find('span.green_btn').fadeIn(300,
                            function(){
                                if($this.parent().find('input.value').length > 0){
                                 $this.parent().find('input.value').fadeOut(300,function(){
                                     $this.parent().find('span.value').fadeIn(300);
                                 });
                                }else if($this.parent().find('textarea.value').length > 0){
                                    $this.parent().find('textarea.value').fadeOut(300,function(){
                                     $this.parent().find('span.value').fadeIn(300);
                                 });
                                }else{
                                    $this.parent().find('.select_wrapper').fadeOut(300,function(){
                                     $this.parent().find('span.value').fadeIn(300);
                                 });
                                }
                            });

                        });
                    });
                }
                });
}

function advanced_search(search_params, csrf){
    /*
        query = {
                'title__icontains': 'String de busqueda',
                'pk__in': JSON.stringify([1,2]) (como en django para la busqueda de pk)
            }
            fields = ['title', 'cover']; campos en los que bas a buscar
            and = 1; is es un query tipo and o tipo or
            join = { (las tablas con las que haces relacion)
                'tables':{
                    0: JSON.stringify(['account.author','account.authortitle']),
                    1: JSON.stringify(['account.rate'])
                },
                'quieres':{
                    0: JSON.stringify(['title_id']),
                    1: JSON.stringify(['element_id'])
                },
                'fields':{
                    0: JSON.stringify(['first_name','last_name']),
                    1: JSON.stringify(['grade'])
                }
            }
            join = JSON.stringify(join); conviertes el join en un string

            search = {
                'type': type, el modelo en el que vas a buscar account.title account.list etc...
                'fields': JSON.stringify(fields),
                'value': JSON.stringify(query),
                'and': and,
                'join': join
            }
            search = JSON.stringify(search); conviertes el objeto a string
            var csrf = el csrf
            result = advanced_search(search, csrf);
    */
    var result;
    $.ajax({
        type: "POST",
        url: '/qro_lee/advanced_search/',
        dataType: 'json',
        async: false,
        data: {
            'fields': search_params,
            'csrfmiddlewaretoken': csrf
        }
    }).done(function(data) {
        result = data;
    });
    return result;
}



function search_api(csrf, query, aux_api){
    var ret = null;
    if(!aux_api)
        aux_api = 0;
    $.ajax({
        type: "POST",
        async: false,
        url: '/qro_lee/search_api/',
        data: {
            'csrfmiddlewaretoken': csrf,
            'search': JSON.stringify(query),
            'aux_api': aux_api
        },
        dataType: 'json'
    }).done(function(data){
        ret = data;
    });
    return ret;
}

function search_book_code(form){
    var code = form.find('input[name=codec]').val();
    var query = {
        'status': 1,
        'code': code
    }
    var fields = ['id','code'];
    var and = 1;
    var join = {
        'tables':{
            0: JSON.stringify(['registry.travel'])
        },
        'quieres':{
            0: JSON.stringify(['id'])
        },
        'fields':{
            0: JSON.stringify(['id'])
        }
    }
    join = JSON.stringify(join);

    var search = {
        'type': 'registry.book',
        'fields': JSON.stringify(fields),
        'value': JSON.stringify(query),
        'and': and,
        'join': join
    }
    search = JSON.stringify(search);
    var csrf = $('.csrf_header').find('div input').val();
    var data_1 = advanced_search(search, csrf);

    form.find('.place_pink').remove();

    if('response' in data_1)
        form.find('input[type=submit]').parent().parent().append('<p class="place_pink text_no_book">No ' +
            'se encontró el código del libro que estas buscando revisa que este bien escrito</p>');
    else
        window.location.href = site_url + '/qro_lee/book/' + code+'_1';

    return false;
}

$(document).ready(function(){

    $('.part_bottom .green_btn').click(function(){

        var lat_long = $('.lat_long').val().split(',');
        var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
        var contraseña = "";
        for (i=0; i<10; i++) contraseña += caracteres.charAt(Math.floor(Math.random()*caracteres.length));

        var query = {
            'lat': lat_long[0],
            'long': lat_long[1],
            'meta': $('.meta').val(),
            'isbn': $('.isbn_book').val(),
            'key' : contraseña,
            'genre': $('.genre_sel').find('select').val()
        }

        $.ajax({
            type: "POST",
            async: false,
            url: '/registry/register_ajax_book/',
            data: {
                'csrfmiddlewaretoken': $('.csrf_header').find('div input').val(),
                'query': JSON.stringify(query),
                'api_type': $('input.api_type').val()
            },
            dataType: 'json'
        }).done(function(data){
                if(data['succes'] == 'True')
                    window.location.href = site_url + '/qro_lee/qr/'+data['code'];
            });
    });

    $('.btn_reg').click(function(){
        var lat_long = $('.lat_long').val().split(',');
        var query = {
            'status': parseInt($('.value_option').find('input').val()),
            'lat': lat_long[0],
            'long': lat_long[1],
            'meta': $('.meta').val(),
            'description': $('.text_descrip').val(),
            'code_book': $('.code_book').val()
        }
       $.ajax({
            type: "POST",
            async: false,
            url: '/registry/cheking_book/',
            data: {
                'csrfmiddlewaretoken': $('.csrf_header').find('div input').val(),
                'query': JSON.stringify(query)
            },
            dataType: 'json'
        }).done(function(data){

               if(data['succes'] == 'True')
                    window.location.href = site_url + '/qro_lee/book/'+data['code_book'];
            });

    });

    $('#form_search').submit(function(e){
        return search_book_code($(this));
     });
    $('#form_isbn').submit(function(e){
        var isbn = $(this).find('input[name=isbn]').val();
        //9786071111104
        //www.googleapis.com/books/v1/volumes?q=isbn:9681606353
        var data_ = api_isbn_search(isbn);
        if(data_ == -1){
            e.preventDefault();
            $(this).find('input[type=submit]').parent().parent().append('<p class="place_pink text_no_book">' +
               'No se encontró el isbn verifica que este correcto</p>');
        }

     });

    if($('.img_profile_mini').length>0){
        load_img_profile();
    }

    $('.sidebar-a .month').html(months[curr_month]);
    var $item = $('.sidebar-a .item').clone();

    $('.heading .search span.search_btn').click(function(){
        search_entities($(this));
    });
    $('.search_ent_field').keyup(function(){
        search_entities($('.heading .search span.search_btn'));
    });
    $('.search_list').click(function(){
        search_list_authors_titles($(this));
    });
    $('.field_list').keyup(function(){

        search_list_authors_titles($('.search_list'));
    });

    $('.search_pages').click(function(){
        search_pages();
    });
    $('.field_pag').keyup(function(){
        search_pages();
    });
    $('.search_field').focusin(function(){
        $(this).css('background','#e7e7e7');
    });
    $('.search_field').focusout(function(){
        $(this).css('background','#98a4a3');
    });
    $('.search_field').keyup(function(){
        search_all_header($('.search_button'));
    });
    $('.search_button').click(function(){
        search_all_header($(this));
    });
    if(entity_search_events){

        $('.sidebar-b .year tr').css({
            'left':(curr_month*125)*-1
        });


        var edit_events;

        if($('.id_entity').val()==undefined){
            edit_events = -1;
        }else{
            edit_events = $('.id_entity').val();
        }

        $.ajax({
            type: "POST",
            url: '/qro_lee/entity/events/'+$('.sidebar-b input.entity').val()+'/',
            data: {
                'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                'curr_month': -1,
                'id_entity':edit_events
            },
            dataType: 'json'
        }).done(function(data){
          var count = 0;
                $.each(data,function(i){
                    var event = data[i];
                    var len = event.length;
                    $.each(event,function(index){
                        var event_data = event[index];
                        var month = event_data[0];
                        var day = event_data[1];
                        var id = event_data[2];
                        var $table;
                        $table = $('.sidebar-b table');
                        $table.find('.month:odd').each(function(index){
                            if((month-1) == index){
                                $table = $(this).parent().parent().parent();

                                $table.find('tr').each(function(){
                                    $(this).find('td').each(function(){

                                        if($(this).html() == day){
                                            $(this).addClass('active-event');
                                            $(this).click(function(){
                                                var day = $(this).html();
                                                var lenth = $('.item').length;
                                                $('.item').each(function(index){
                                                    if(!$(this).find('.date').hasClass('day_'+day))
                                                        $(this).fadeOut();
                                                    else{
                                                        $(this).fadeIn();
                                                        $(this).css('display','block');
                                                    }
                                                });


                                            });
                                        }
                                    });
                                });
                            }
                        });



                        if(count == (len-1)){
                            populateCal(curr_month,$item);

                        }
                        count++;
                    });
                });

            });



    }

    $('.sidebar-b .controller .next').click(function(){
            if( curr_month < 11 && clickable){
                clickable = false;
                curr_month++;
                var position = $('.sidebar-b .year tr').position();
                var left = position.left-125;
                $('.sidebar-b .year tr').animate({
                    'left':left
                },function(){
                    clickable = true;
                });
                $('.sidebar-a .month').html(months[curr_month]);
                populateCal(curr_month,$item);
            }
        });
        $('.sidebar-b .controller .prev').click(function(){
            if(curr_month > 0 && clickable){
                clickable = false;
                curr_month--;
                var position = $('.sidebar-b .year tr').position();
                var left = position.left+125;
                $('.sidebar-b .year tr').animate({
                    'left':left

                },function(){
                    clickable = true;
                });
                $('.sidebar-a .month').html(months[curr_month]);
                populateCal(curr_month,$item);
            }

        });

    $('.selec_reg ').change(function(){
            map_select();
    });

    if($('#reg_map').length>0){
        map_select();
    }

    if($('#d-map').length>0){
            $.ajax({
                type: "POST",
                url: '/qro_lee/entities/spot/',
                data: {
                    'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                    'post': 2
                },
                dataType: 'json'
            }).done(function(data){
                dmap(data,1);

            });
    }

    if($('#map').length>0 ){

        if(!$('#map').hasClass('map')){
            if($('.d-latlon').length>0){
                var lattong = $('.d-latlon').val();
                lattong = lattong.split(',');
                if(lattong.length>1)
                    init(lattong[0], lattong[1]);
            }
        }

        if($('#map').hasClass('map_crossing')){
            query = {
                'book__status':1
            }
            fields = ['user','book','lat','long'];
            and = 0;
            join = {
                'tables':{
                    0: JSON.stringify(['registry.book'])
                },
                'quieres':{
                    0: JSON.stringify(['id'])
                },
                'fields':{
                    0: JSON.stringify(['id','title'])
                }
            }
            join = JSON.stringify(join);

            var search = {
                'type': 'registry.travel',
                'fields': JSON.stringify(fields),
                'value': JSON.stringify(query),
                'and': and,
                'join': join
            }
            search = JSON.stringify(search);
            var csrf = $('.csrf_header').find('div input').val();
            var data = advanced_search(search, csrf);
            dmap(data,2);
        }
    }

$('.affiliate').each(function(i){
        if(i == counter){
            $(this).addClass('margin');
            counter += 3;
        }

    });


    $('.alert-message .accept').click(function(){
        var user = $(this).parent().find('input.user').val();

        $('.affiliate').each(function(index){
            $(this).removeClass('margin');
            if($(this).hasClass('user_'+user)){
                $(this).fadeOut(300,function(){
                    $(this).remove();
                    $('.affiliate').each(function(i){
                        if(i == counter){
                            $(this).addClass('margin');
                            counter += 3;
                        }
                    });
                });
            }

        });

        $(this).parent().fadeOut(300,removeUser($(this).parent(), user, parseInt($('input.type').val()), $('.alert-message input.entity').val()));
    });
    $('.alert-message .reject').click(function(){
        $('.container_message').fadeOut(300);
    });
    $('.entity .admin_nav.nav .btn:eq(0)').click(function(){

        $('.admin').find("*[class*='user_']").each(function(){
            $(this).remove();
        });
        $('input.type').val(1);
        findUser($('.alert-message'), '-1',
            $('.alert-message').find('.entity').val(), $('.admin'));
    });
    $('.entity .admin_nav.nav .btn.members').click(function(){
        $('.mmembers').find("*[class*='user_']").each(function(){
            $(this).remove();
        });
        $('input.type').val(2);
        findUser($('.alert-message'), '-3',
            $('.alert-message').find('.entity').val(), $('.mmembers'));
    });
    $('.entity .admin_nav.nav .btn.request_btn').click(function(){
        $('.request').find("*[class*='user_']").each(function(){
            $(this).remove();
        });
        $('input.type').val(1);
        findUser($('.alert-message'), '-2',
            $('.alert-message').find('.entity').val(), $('.request'));
    });


    /*$('.entity .nav .btn:eq(2)').click(function(){
        $('.admin').find("*[class*='user_']").each(function(){
            $(this).remove();
        });
        findUser($('.alert-message'), '-1',
            $('.alert-message').find('.entity').val(), $('.admin'));
    });*/

    $('.all_book').click(function(){
        show_titles($(this));
    });
    $('.all_items').click(function(){
        show_items($(this));
    });
    $('.rate').click(function(){
         add_rate($(this));
    });


    $('.text_act').click(function(){
        show_title_act($(this));
    });

    $('.search_result').fadeOut(250);
    if(!set_act)
        $('.sub-menu-h').fadeOut(250);
    set_act = false;
    $('.nav .btn:eq(0)').trigger('click');

    if($('.discussion.load').length > 0){
        $('.discussion.load a.title').click(function(e){
            $('.discussion_contents .discuss').remove();
            e.preventDefault();
            discussion($(this).attr('id'));
            return false;
        });
        $('.brown_btn.discuss').click(function(){
            $('.create-discussion input').val('');
            $('.create-discussion textarea').val('');
            $('.alert-message').fadeOut(300, function(){
                $(this).parent().fadeIn(300);
                $(this).parent().find('.create-discussion-wrapper').fadeIn(300);
            });
        });
        $('.create-discussion-wrapper .accept').click(function(){

            var name = $('.create-discussion input').val();
            var content = $('.create-discussion textarea').val();
            create_discussion($('input.entity').val(), name, content);
        });
    }

});


function api_isbn_search(isbn){
    var data_ = -1;
    $.ajax({
            'async': false,
            'global': false,
            'url': 'https://www.googleapis.com/books/v1/volumes?q=isbn:'+isbn,
            'dataType': "json",
            'success': function (data) {
                data_ = data;
                if(data['totalItems'] == 0){
                    data_ = -1;
                }
            }
    }).done(function(){
            if(data_ == -1){
                var result = search_api($('.csrf_header').find('input').val(),isbn, -1);
                if (result['result_api'] != -1){
                    data_ = 1;
                    $('.api_type').val('goodreads_api');
                }

            }
        });

    return data_;

}

var textarea_flag = false;
var textarea_flag2 = false;
function create_discussion(entity_id, name, content){
    $.ajax({
        type: "POST",
        url: '/qro_lee/create_discussion/',
        data: {
            'csrfmiddlewaretoken':$('.csrf_header').find('input').val(),
            'entity_id': entity_id,
            'name':name,
            'content': content
        },
        dataType: 'json'
    }).done(function(data){
            $('.create-discussion-wrapper').parent().fadeOut(300);
            var discuss = data['response'];
            var $span = $('<span class="item">' +
                '<a href="#" id="'+discuss.id+'" style="margin-top: 5px;" class="title no-margin">'+discuss.name+'</a>' +
                '<p class="no-margin">Por ' +
                '<a class="spot category" href="#">' +discuss.username+'</a></p>' +
                '<p style="margin-top:5px;" class="no-margin gray_text">0 comentarios</p></span>');
            $span.find('a.title').click(function(e){
                $('.discussion_contents .discuss').remove();
                    e.preventDefault();
                    discussion($(this).attr('id'));
                    return false;
            });
            $span.find('a.title').trigger('click');
            if($('.discussion').find('.overview .item').length > 0)
                $('.discussion').find('.overview .item').before($span);
            else{
                $('.discussion').find('.overview p').before($span);
                $('.discussion').find('.overview p').remove();
            }
        });
}


function discussion(id){
    $.ajax({
        type: "POST",
        url: '/qro_lee/get_a_discussion/',
        data: {
            'csrfmiddlewaretoken':$('.csrf_header').find('input').val(),
            'id': id
        },
        dataType: 'json'
    }).done(function(data){
            var $item = $('div.discuss.main').clone();
            $item.removeClass('main');
            $item.find('.main textarea').focus(function(){
                if(!textarea_flag){
                    $(this).val('');
                    textarea_flag = true;
                }
            });
            var parent = data['parent'];
            $item.find('.title').html(parent.name);
            $item.find('p.main_content').html(parent.content);
            $item.find('p a').html(parent.username);
            $item.find('p a').attr('href', '/accounts/users/profile/'+parent.user);
            data = data['discussion'];
            respond_discussion(
                $item.find('.respond_btn'),
                id, $item,
                $('input.entity').val(), false
            );

            $.each(data, function(i){
                var counter = 0;
                $.each(data[i], function(index){
                        var discussion = data[i][index];
                        var $discussion_response = $('.discussion_response').clone();
                        $discussion_response.removeClass().addClass('discussion_response grid-9 no-margin fleft item_'+discussion.id);

                        if($discussion_response.hasClass('item_'+discussion.id)){
                            $discussion_response.find('.answer p').html(discussion.content);
                            $discussion_response.find('.name.title').html(discussion.username);
                            if(!discussion.user_pic){
                                discussion.user_pic = '/static/img/create.png';
                            }else{
                                discussion.user_pic = '/static/media/users/'+discussion.user+'/profile/'+discussion.user_pic;
                            }
                            $discussion_response.find('.wrapper img').attr('src', discussion.user_pic);

                            var parent_id = id;
                            if(index != 0){
                                $discussion_response.removeClass('grid-9 fleft').addClass('grid-8 fright child_'+discussion.parent_discussion);
                                $discussion_response.find('.answer').removeClass('grid-8').addClass('grid-7');
                                $discussion_response.find('.respond_btn').remove();
                                if(discussion.user != $discussion_response.find('.answer').find('.u_id').val())
                                    $discussion_response.find('.answer').find('.erase_btn').remove();

                            }else{
                                parent_id = discussion.id
                                if(discussion.user != $discussion_response.find('.answer').find('.u_id').val())
                                    $discussion_response.find('.answer').find('.erase_btn').remove();

                            }
                            if($discussion_response.find('.answer').find('.erase_btn').length > 0){
                                $discussion_response.find('.answer').find('.erase_btn').click(function(){
                                    erase_discussion(discussion.id, $discussion_response);
                                });
                            }
                            $discussion_response.find('.respond_btn').click(function(){
                                var $respond = $('.discuss.main .respond').clone();
                                $respond.removeClass('fleft respond').addClass('grid-8 fright no-margin');
                                $respond.find('textarea').removeClass('grid-8').addClass('grid-7');

                                $respond.insertAfter($discussion_response);
                                $respond.find('textarea').focus(function(){
                                    if(!textarea_flag2){
                                        $(this).val('');
                                        textarea_flag2 = true;
                                    }
                                });
                                respond_discussion(
                                    $respond.find('.respond_btn'),
                                    parent_id, $respond,
                                    $('input.entity').val(), true
                                );
                            });


                            $item.append($discussion_response);
                            $discussion_response.fadeIn(300);
                        }



                });
            });
            $('.discussion_contents').append($item);
            $item.fadeIn(300);

        });
}

function erase_discussion(id, $ele){
    $.ajax({
        type: "POST",
        url: '/qro_lee/get_a_discussion/',
        data: {
            'csrfmiddlewaretoken':$('.csrf_header').find('input').val(),
            'erase': id
        },
        dataType: 'json'
        }).done(function(data){
            $ele.fadeOut(300,function(){
                $(this).remove();
            });
        });
}

function respond_discussion($ele, parent_discussion, $item, entity_id, is_son){

    $ele.click(function(){
        $.ajax({
        type: "POST",
        url: '/qro_lee/respond_to_discussion/',
        data: {
            'csrfmiddlewaretoken':$('.csrf_header').find('input').val(),
            'parent_discussion': parent_discussion,
            'response': $item.find('textarea').val(),
            'entity_id': entity_id
        },
        dataType: 'json'
        }).done(function(data){
                var discussion = data['response'];
                var $discussion_response = $('.discussion_response.main').clone();
                $discussion_response.removeClass().addClass('discussion_response grid-9 no-margin fleft item_'+discussion.id);

                if($discussion_response.hasClass('item_'+discussion.id)){
                    $discussion_response.find('.answer p').html(discussion.content);
                    $discussion_response.find('.name.title').html(discussion.username);

                    if(!discussion.user_pic){
                        discussion.user_pic = '/static/img/create.png';
                    }else{
                        discussion.user_pic = '/static/media/users/'+discussion.user+'/profile/'+discussion.user_pic;
                    }
                    $discussion_response.find('.wrapper img').attr('src', discussion.user_pic);

                    if(is_son){
                        $discussion_response.find('.respond_btn').remove();
                        $discussion_response.removeClass('grid-9 fleft').addClass('grid-8 fright child_'+discussion.parent_discussion);
                        $discussion_response.find('.answer').removeClass('grid-8').addClass('grid-7');
                        $discussion_response.insertBefore($ele.parent());

                        $ele.parent().remove();
                        if($discussion_response.find('.answer').find('.erase_btn').length > 0){
                                $discussion_response.find('.answer').find('.erase_btn').click(function(){
                                    erase_discussion(discussion.id, $discussion_response);
                                });
                            }
                    }else{

                        //$discussion_response.find('.respond_btn').remove();
                        if($discussion_response.find('.answer').find('.erase_btn').length > 0){
                                $discussion_response.find('.answer').find('.erase_btn').click(function(){
                                    erase_discussion(discussion.id, $discussion_response);
                                });
                            }
                        $discussion_response.insertAfter($item.find('.respond'));
                        $discussion_response.find('.respond_btn').click(function(){
                                var $respond = $('.discuss.main .respond').clone();
                                $respond.removeClass('fleft respond').addClass('grid-8 fright no-margin');
                                $respond.find('textarea').removeClass('grid-8').addClass('grid-7');
                                $respond.find('textarea').focus(function(){
                                    if(!textarea_flag2){
                                        $(this).val('');
                                        textarea_flag2 = true;
                                    }
                                });
                                $respond.insertAfter($discussion_response);
                                respond_discussion(
                                    $respond.find('.respond_btn'),
                                    discussion.id, $respond,
                                    $('input.entity').val(), true
                                );
                        });
                    }
                    $discussion_response.fadeIn(300);


                }
            });
        if(textarea_flag)
            $item.find('textarea').val('Escribe un comentario...');
        textarea_flag = false;
        textarea_flag2 = false;
    });
}


function delete_title($btn_delete){


        $.ajax({
            type: "POST",
            url: '/registry/delete_title/',
            data: {
            'csrfmiddlewaretoken':$('.csrf_header').find('input').val(),
            'id_title':$btn_delete.find('.id_title').val(),
            'type':$btn_delete.find('.type_list').val(),
            'type_list':$('.type_my_list').val(),
            'id_list':$btn_delete.find('.id_list_rel').val()
            },
            dataType: 'json'
        }).done(function(data){
           $btn_delete.fadeOut(250,function(){
                $(this).remove();
                disable_link_all(true);
           });
        });
}

function delete_item($btn_delete, type){
    var url = '';
    if(type == 'P')
        url = '/registry/delete_page/';
    if(type == 'L')
        url = '/registry/delete_list/';
    $.ajax({
        type: "POST",
        url: url,
        data: {
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
            'id_list':$btn_delete.find('.id_list').val()
        },
        dataType: 'json'
    }).done(function(data){
            $btn_delete.fadeOut(250,function(){
                $(this).remove();
            });
        });
}

function add_titles_list(csrf, id_list){

    var title_ids = [];
    $.each($('.add_my_list .d-item_book'),function(i){
        title_ids.push(parseInt($(this).find('.id_title').val()));
    });

    var type_list = 'T';

    if($('.d_type_list').length > 0)
        type_list = $('.d_type_list').val();
    if($('.type_list').length > 0)
        type_list = $('.type_list').val();

    $.ajax({
        type: "POST",
        url: '/registry/add_titles_my_list/',
        data:{
            'csrfmiddlewaretoken': csrf,
            'list':JSON.stringify(title_ids),
            'id_list':id_list,
            'type':type_list
        },
        dataType: 'json'
    }).done(function(data) {

        return data;

    });
}

function edit_title_read(id, type, $this){

$.ajax({
        type: "POST",
        url: '/registry/edit_title_read/',
        data:{
            'csrfmiddlewaretoken':$('.csrf_token').find('input').val(),
            'id_list':id,
            'date':$('.date_read').val(),
            'type':type
        },
        dataType: 'json'
    }).done(function(data) {

        if(data.type == 1){
            $('.count_titles_read').html(Object.keys(data.list_read[1]).length +
                ' libros leídos');
            $('.title_act_read').fadeOut(250,function(){
                $('.title_act_read').empty();
                text = $('<span class="text_act">¿Qué estás leyendo?</span>');
                text.append('<input type="hidden" class="type_message" value="show_titles" />');
                $('.title_act_read').append(text);
                text.click(function(){
                    show_title_act($(this));
                });
                $('.title_act_read').fadeIn(250);
            });
            container_list = $('.book_read');

            container_list.find('.d-item_book').remove();
            var title = data.list_read[1];
            $.each(title,function(i2){
                name = title[i2].title;
                name = name.replace(/\s/g,'');
                href = '/qro_lee/profile/title/' + title[i2].id + '/';
                div = $('<div class="d-item_book d-item_' + title[i2].id +
                    ' grid-5 no-margin"></div>');
                input_id =$('<input type="hidden" class="id_title"' +
                    'value="'+title[i2].id+'"/>');
                input_title =$('<input type="hidden" class="name_title"' +
                    'value="'+title[i2].title+'"/>');
                input_list = $('<input type="hidden" class="type_list"' +
                    'value="1"/>');
                input_rel = $('<input type="hidden" value="'+ title[i2].id_list +'" class="id_list_rel">');
                a_ref = $('<a href="'+href+'"></a>');
                a_wrapper = $('<a href="'+href+'"></a>');
                span = $('    <span class="wrapper_list borde_author" ></span>');
                img = $('<img class="img_size_all" src="'+title[i2].cover +
                    '"/>');
                div_text = $('<div class="d-container_text_book grid-3 no-margin"></div>');
                a_t = $('<a href="' + href +
                    '" class="title title_book alpha grid-4 "></a>');
                a_t.append(truncText(title[i2].title,15));
                href_author = '/qro_lee/profile/author/'+title[i2].id_author;
                name_author = '<a class="place_pink" >autor anonimo</a>';
                if((title[i2].author).length!=0)
                    name_author = 'De <a href="' + href_author +
                        '" class="place_pink" >' + truncText(title[i2].author,12)  +
                        '</a>';
                p_author = $('<p class="p-d-text" >' + name_author +'</p>');
                span_rate = $('<span></span>');
                p_date = $('<p class="p-d-text d-text_opacity"> leído'+
                    title[i2].date + '</p>');
                btn_del = $('<span class="pink_btn size_btn_edit message_alert">-</span>');
                btn_edit = $('<span class="green_btn message_alert size_btn_edit">Editar</span>');
                        btn_edit.append('<input class="type_message" type="hidden" value="edit_read">');
                        btn_edit.append('<input class="name_title" type="hidden" value="'+title[i2].title+'">');
                input_type = $('<input class="type_message" type="hidden" ' +
                    'value="delete_title"/>');
                p_stars = $('<p class="no-margin stars_grade grid-2"></p>');
                for(ind = 0;ind<5;ind++){
                    if(ind<title[i2].grade)
                        p_stars.append('<img class="starts_mini" src="/static/img/comunityStar.png">');
                    else
                        p_stars.append('<img class="starts_mini" src="/static/img/backgroundStar.png">');
                }

                span.append(img);
                div.append(input_id);
                div.append(input_title);
                div.append(input_list);
                div.append(input_rel);
                div.append(span);
                div.append(div_text);
                div_text.append(a_t);
                div_text.append(p_author);
                div_text.append(p_stars);
                div_text.append(p_date);
                div_text.append(btn_del);
                div_text.append(btn_edit);
                btn_del.append(input_type);
                div_add = container_list.find('.d-container_add_book');
                div_add.after(div);

            });
            container_list.find('.grid-15').find('.all_book').find('input').val(1);
            disable_link_all(true);
            show_dialog();
        }
        if(data.type == 2){
            var text_date = $this.parent().find('.d-text_opacity');
            var date = data.date;
            date = date.split('-');

            text_date.fadeOut(250,function(){
                text_date.empty();
                text_date.append('leído ' + date[2] + ' de ' + months[(date[1]-1)]
                    + ' ' + date[0]);
                text_date.fadeIn(250);
            });
        }
    });
}


function show_title_act($this){

    var type = $('.type').val();
    if(type == "List"){

        var type_message = $this.find('.type_message').val();
        if(type_message=="show_titles"){
            d_show_dialog(0);
        }
    }
}
function append_titles(overview, data, in_api){
    var array_id_api = new Array();
    $.each(data,function(i){
        var href = '';
        if(!in_api){
            array_id_api.push(data[i].id_google);
            href = 'href="/qro_lee/profile/title/'+data[i].id + '"';
        }

        div = $('<div class="grid-5 item_tit fleft results margin_bottom' +
            ' no-margin"></div>');
        div_item = $('<div class="item"></div>');
        a_wrapper = $('<a ' + href + ' ></a>');
        span = $('<span class="wrapper wrapper_book fleft ' +
            'no_margin-right"></span>');
        a_wrapper.append(span);
        div_item.append(a_wrapper);
        img = $('<img class="img_size_all" src="' + data[i].picture + '" alt=""/>');
        span.append(img);
        a_title = $('<a ' + href + ' ></a>');
        h3 = $('<h3 title="' + data[i].title +
            '" class="title title_book margin_left no-margin' +
            ' grid-2 fleftt"></h3>');
        h3.append(truncText(data[i].title,8));
        a_title.append(h3);
        div_item.append(a_title);
        var name_author = data[i].author;
        var href_a = '';

        if(data[i].author != 'autor anonimo'){
            name_author = name_author.substring(0,15);
            if(!in_api)
                href_a = 'href="/qro_lee/profile/author/' + data[i].id_author + '"';
        }

        p = $('<p class="fleft margin_left no-margin grid-2"></p>');
        a_author = $('<a class="title_author" ' + href_a + '></a>');
        a_author.append(name_author);
        p.append(a_author);
        div_item.append(p);
        p_genre = $('<p class="fleft margin_left no-margin grid-2"></p>');
        var genre = data[i].genre;
        $.each(genre,function(index){
            if(index<=3){
                p_genre.append(' <span class="title_author">' +
                    genre[index] + '</span>');
            }
        });
        p_stars = $('<p class="fleft stars_title margin_left no-margin grid-2"></p>');
        for(ind = 0;ind<5;ind++){
            if(ind<data[i].grade)
                p_stars.append('<img class="starts_mini" src="/static/img/comunityStar.png">');
            else
                p_stars.append('<img class="starts_mini" src="/static/img/backgroundStar.png">');
        }
        div_item.append(p_genre);
        div_item.append(p_stars);
        div.append(div_item);
        overview.append(div);
        if(in_api){
            a_wrapper.addClass('cursor_p');
            a_title.addClass('cursor_p');
            a_wrapper.click(function(){
                register_title_click(data[i]);
            });
            a_title.click(function(){
                register_title_click(data[i]);
            });
        }
    });

    return array_id_api;
}

function register_title_click(data){
    $.ajax({
        type: "POST",
        url: '/registry/register_title_click/',
        data:{
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
            'dict': JSON.stringify(data)
        },
        dataType: 'json'
    }).done(function(data) {
            if(data.succes == 'True')
                window.location.href = site_url + '/qro_lee/profile/title/' + data.id_title;
        });
}

function search_list_authors_titles($this){

    var url = '';
    var text = '';
    var id_profile = 0;
    var session_user = 0;
    var data_title;

    if($('.type').val()=="List"){
        url = '/list/';
        text = ' Listas ';
        id_profile = parseInt($('.id_profile').val());
        session_user = parseInt($('.sesion_user').val());
    }
    if($('.type').val()=="Title"){
        url = '/book/titles/';
        text = ' Títulos';
    }
    if($('.type').val()=="Author"){
        url = '/book/authors/';
        text = ' Autores';
    }
    csrf = $('.csrf_header').find('input').val();
    my_list_type = parseInt($this.parent().find('.my_list_typ').val());
    $.ajax({
        type: "POST",
        url: '/qro_lee'+url,
        dataType: 'json',
        data: {
            'csrfmiddlewaretoken': csrf,
            'field_value':$('.field_list').val(),
            'type_list':my_list_type,
            'id_profile':id_profile
        }
    }).done(function(data) {

            if(data){

                var overview;
                if(my_list_type==0){
                    overview = $('.my_items_list');
                }else{
                    overview = $('.overview');
                }

                overview.parent().append('<span class="grid-14 no-pandding no-margin loading_image"'+
                    'style="margin-top:100px;" ><img src="/static/img/loading.gif" class="center" /></span>');
                overview.fadeOut(300,function(){
                    overview.empty();

                    if($('.type').val()=="List"){

                        $.each(data,function(i){
                            var href = '/qro_lee/profile/list/'+ data[i].id;
                            div = $('<div class="item_list d-list_' + data[i].id + ' " ></div>');
                            a_wrapper = $('<a href="' + href + '"></a>');
                            span = $('<span class="wrapper_list" ></span>');
                            a_wrapper.append(span);
                            input_name = $('<input class="name_list" type="hidden" value="'+data[i].name+'">');
                            input_id_rel = $('<input class="id_list" type="hidden" value="'+data[i].id+'">');
                            div.append(input_name);
                            div.append(input_id_rel);
                            div.append(a_wrapper);
                            var grid = 'grid-13';
                            if(my_list_type==1)
                                grid = 'grid-12';
                            var src = '/static/img/create.png';
                            if(data[i].picture != '')
                                src = '/static/media/users/' + data[i].id_user + '/list/' +
                                    data[i].picture ;
                            img = $('<img class="img_size_all" src="' + src + '"/>');
                            span.append(img);
                            if(my_list_type==0){

                                span_title = $('<span class="title alpha title_book grid-4"></span>');
                                span_btn = $('<span class="container_btn grid-4 no-margin"></span>');
                                edit_list = $('<a href="/registry/edit_list/' + data[i].type +
                                    '/' + data[i].id + '"></a>');
                                span_save = $('<span class="green_btn size_btn_edit marg_edit" >Editar</span>')
                                del_list = $('<span class="pink_btn size_btn_edit message_alert" >-'+
                                    '<input class="type_message" type="hidden" value="delete_list"></span>');
                                edit_list.append(span_save);
                                span_btn.append(edit_list);
                                span_btn.append(del_list);
                                div.append(span_title);
                                if(session_user==id_profile)
                                    div.append(span_btn);

                            }else{

                                span_data = $('<span class="container_data ' + grid + ' no-margin">'+
                                    '</span>');
                                span_title = $('<span class="grid-9 no-margin"></span>');
                                span_data.append(span_title);
                                div.append(span_data);
                            }

                            a_title =  $('<a title="' + data[i].name + '" href="' +
                                href + '" class="title alpha title_book"></a>');
                            a_title.append(data[i].name);

                            if(my_list_type==0){
                                p_stars = $('<span class="fright"></span>');
                            }else{
                                p_stars = $('<span class="grid-3 no-margin"></span>');
                            }

                            span_stars = $('<span class="fright margin_top" ></span>');
                            for(ind = 0;ind<5;ind++){
                                if(ind<data[i].grade)
                                    span_stars.append('<img src="/static/img/comunityStar.png">');
                                else
                                    span_stars.append('<img src="/static/img/backgroundStar.png">');
                            }
                            if(data[i].type == 'T')
                                type = 'libros';
                            else
                                type = 'autores';



                            p_by = $('<span class="d-text_list ' + grid + ' d-text_opacity no-margin" >'+
                                'Lista con ' + data[i].count +' ' + type + ' creada por </span>');
                            text_by = $('<a href="/accounts/users/profile/' +
                                data[i].id_user + '" class="d-pink"></a>');
                            text_by.append(data[i].user);
                            p_by.append(text_by);
                            p_text = $('<span class="d-text_list ' + grid + ' no-margin" ></span>');
                            p_text.append(truncText(data[i].description,350));
                            span_title.append(a_title);
                            p_stars.append(span_stars);
                            if(my_list_type==0){
                                div.append(p_stars);
                                div.append(p_by);
                                div.append(p_text);
                            }else{
                                span_data.append(p_stars);
                                span_data.append(p_by);
                                span_data.append(p_text);
                            }
                            overview.append(div);
                        });
                    }
                    if($('.type').val()=='Title'){

                        var array_id_api = append_titles(overview, data, false);
                        var csrf = $('.csrf_header').find('input').val();
                        var value = $('.field_list').val();
                        if(value.length == 0)
                            value = '';

                        var data_api = search_titles_and_author_in_api_bd('T', csrf, value);
                        data_api = data_api[1];
                        data_api = data_api['result_api']['items'];
                        data_title = data_api;

                        var data_items = {};
                        $.each(data_api, function(i){
                            var id_exist = false;
                            $.each(array_id_api, function(in2){
                                if(array_id_api[in2] == data_api[i].id){
                                    id_exist = true;
                                }
                            });
                            if(!id_exist){
                                var picture = '';
                                var author = 'autor anonimo';
                                var publisher = '';
                                var pageCount = 100;
                                var language = '';
                                var volumeInfo = data_api[i]['volumeInfo'];
                                var isbn = volumeInfo['industryIdentifiers'];
                                var subtitle = '';
                                var country = '';
                                var isbn1 = '';
                                var isbn2 = '';
                                var published_date = '2000-01-01';

                                if('imageLinks' in volumeInfo)
                                    if('thumbnail' in volumeInfo['imageLinks'])
                                        picture = volumeInfo['imageLinks']['thumbnail']
                                if('authors' in volumeInfo)

                                    if(volumeInfo['authors'].length > 0)
                                        author = volumeInfo['authors'][0];

                                if('publisher' in volumeInfo)
                                    publisher = volumeInfo['publisher'];

                                if('pageCount' in volumeInfo)
                                    pageCount = volumeInfo['pageCount'];

                                if('language' in volumeInfo)
                                    language = volumeInfo['language'];

                                if('subtitle' in volumeInfo)
                                    subtitle = volumeInfo['subtitle'];

                                if('publishedDate' in volumeInfo){
                                    var date = volumeInfo['publishedDate'];
                                    date = date.split('-');
                                    var text = '';
                                    if(date.length == 1)
                                        text = '-01-01';

                                    if(date.length == 2)
                                        text = '-01';

                                    published_date = volumeInfo['publishedDate' + text];

                                }

                                if('country' in data_api[i]['accessInfo'])
                                    country = data_api[i]['accessInfo']['country'];

                                if('identifier' in isbn[0])
                                    isbn1 = isbn[0]['identifier'];

                                if(isbn.length > 1)
                                    if('identifier' in isbn[1])
                                        isbn2 = isbn[1]['identifier'];

                                var items = {
                                    'id': data_api[i].id,
                                    'picture': picture,
                                    'title': volumeInfo['title'],
                                    'id_author': '0',
                                    'author': author,
                                    'genre': '',
                                    'grade': 0,
                                    'publisher': publisher,
                                    'isbn': isbn1,
                                    'isbn13': isbn2,
                                    'language': language,
                                    'type': 'T',
                                    'cover': picture,
                                    'country': country,
                                    'id_google': data_api[i].id,
                                    'subtitle': subtitle,
                                    'published_date': published_date
                                }
                                data_items[data_api[i].id] = items;
                            }
                        });


                        append_titles(overview, data_items, true);

                    }

                    if($('.type').val()=='Author'){
                        $.each(data,function(i){
                            href = '/qro_lee/profile/author/' + data[i].id;
                            div = $('<div class="grid-7 alpha">' +
                                '</div>');
                            a_wrapper = $('<a href="' + href + '" ></a>');
                            span = $('<span class="wrapper ' +
                                'border_author "><span>');
                            img = $('<img class="img_size_all" alt="" ' +
                                'src="' + data[i].picture + '"/>');
                            a_wrapper.append(span);
                            div.append(a_wrapper);
                            span.append(img);
                            a = $('<a title="' + data[i].name + '" href="' + href +
                                '" class="title alpha grid-4"></a>');
                            a.append(truncText(data[i].name,20));
                            p_text = $('<p class="grid-4 no-margin text_biography"></p>');
                            p_text.append(truncText(data[i].biography,180));
                            p_titles = $('<p class="title_author grid-4 no-margin">' +
                                '</p>');
                            div.append(a);
                            div.append(p_text);
                            div.append(p_titles);
                            text_title = 'no tiene Títulos';
                            if(data[i].count!=0)
                                text_title = data[i].count + ' Títulos';

                            p_titles.append(text_title);
                            overview.append(div);

                        });
                    }
                    $('.no_resuls').remove();
                    if(Object.keys(data).length==0){
                        var empty = true;
                        if($('.type').val() == 'Title'){
                            if(Object.keys(data_title).length >= 1)
                                empty = false;
                        }
                        if(empty){
                            div = $('<div class="grid-14 no_resuls">No se pudieron encontrar  ' +
                                text + ' </div>');
                            overview.append(div);
                        }
                    }

                    overview.fadeIn(200,function(){
                        if($('#scrollbar1').length>0)
                            $('#scrollbar1').tinyscrollbar();
                    });
                    overview.parent().find('.loading_image').remove();
                    show_dialog();
                });

            }else{
                overview.fadeOut(200);
            }
        });
}


function search_entities($this){
    var $item = $('.sidebar-a .item').clone();

    //if(content_search_entity){
    if($this.parent().find('.type').val()=='Event'){

        $('.sidebar-a .item').each(function(){
            $(this).remove();
        });
        populateCal(100,$item);

    }else{
        var url = '/qro_lee/entities/'+
            $this.parent().find('.type').val()+'/';

        var field_search;
        if($('.alert-message').length > 0 ){
            $('.load').find("*[class*='user_']").each(function(){
                $(this).remove();
            });
            var $email = $('.alert-message input.user').val(
                $this.parent().find('input.search').val());
            var entity = $('.alert-message input.entity').val();
            findUser($('.alert-message'), $email.val(), entity,$('.load.add'));
            return;
        }else if($this.parent().find('input[type=text]').val().length>=1){
            field_search = $this.parent().find('input[type=text]').val();
        }else{
            field_search = "*";
        }
        $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            data: {
                'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                'field_search_entity': field_search
            }
        }).done(function(data) {

                if(data){
                    $('.overview').fadeOut(250,function(){
                        $('.overview').empty();
                        var len = 0;
                        var empty = false;
                        $.each(data,function(index){
                            var entity_obj = data[index];

                            $.each(entity_obj,function(i){
                                empty = true;
                                var img_src;
                                var count = 1;
                                if(entity_obj[i].type=='spot'){

                                    div = $('<div class="grid-7 omega d-spot"></div>');
                                    var d_name = entity_obj[i].name;
                                    d_name = d_name.replace(/\s/g,'');
                                    var href = '/qro_lee/entity/spot/'+ entity_obj[i].id+'/';
                                    a = $('<a href="' + href +
                                        '" class="wrapper d-wrapperspot"></a>');
                                    divtext = $('<div class="d-text_spot "></div>');
                                    if(entity_obj[i].picture != '')
                                        img_src = '/static/media/users/'+
                                            entity_obj[i].user + '/entity/'
                                            + entity_obj[i].picture;
                                    else
                                        img_src ='';

                                    href2 = '/registry/edit/' + entity_obj[i].id+'/';
                                    img = $('<img class="img_size_all" src="'+img_src+'" atr="" >');
                                    btn = $('<a class="brown_btn" href="' + href2 + '">Editar</a>');
                                    div.append(a.append(img));

                                    if(entity_obj[i].user==$('.id_user').val()){
                                        div.append(a.append(btn));
                                    }

                                    a2 = $('<a href="' + href +
                                        '" class="title alpha grid-4 d-title_spot"></a>');
                                    div.append(a2);
                                    p = $('<p></p>');
                                    div.append(divtext.append(p));
                                    $('.overview').append(div);
                                    div.find('.title').html(entity_obj[i].name);
                                    div.find('.title').append('<img src="/static/img/markers/marker'+
                                        count + '.png" class="d-icon_map fleft">');
                                    div.find('p').html(truncText(entity_obj[i].address,180)+
                                        '<br>' +'<a class="d-pink" href="">Biblioteca</a>');
                                    count++;

                                }else{

                                    var div;

                                    if(len%2 == 0)
                                        div = $('<div class="grid-7 alpha">' +
                                            '</div>');
                                    else
                                        div = $('<div class="grid-7 omega">' +
                                            '</div>');
                                    var d_name = entity_obj[i].name;
                                    d_name = d_name.replace(/\s/g,'');
                                    var href = '/qro_lee/entity/organization/' + entity_obj[i].id+'/';

                                    a = $('<a href="'+ href + '" class="wrapper">' +
                                        '</a>');

                                    if(entity_obj[i].picture != '')
                                        img_src = '/static/media/users/' +
                                            entity_obj[i].user+'/entity/'
                                            + entity_obj[i].picture;
                                    else
                                        img_src ='/static/img/create.png';

                                    img = $('<img class="img_size_all" src="'+img_src+'" atr="" >');
                                    href_edit = '/registry/edit/'+entity_obj[i].id+'/';
                                    btn = $('<a class="green_btn" href="' +
                                        href_edit + '">Editar</a>');
                                    div.append(a.append(img));

                                    if(entity_obj[i].user==$('.id_user').val()){
                                        div.append(a.append(btn));
                                    }

                                    a2 = $('<a href="'+href+'" class="title alpha' +
                                        ' grid-4"></a>');
                                    div.append(a2);
                                    p = $('<p></p>');
                                    div.append(p);
                                    $('.overview').append(div);
                                    div.find('.title').html(entity_obj[i].name);
                                    div.find('p').html(truncText(entity_obj[i].
                                        description,180));
                                    div.find('.img');
                                }
                            });
                            $('.d-not_found').remove();

                            if(!empty){
                                var message = 'organizaciones';

                                if($('.type').val() == 'group')
                                    message = 'grupos';

                                if($('.type').val() == 'spot')
                                    message = 'spots';

                                text_no_found(message);
                            }
                            $('#scrollbar1').tinyscrollbar();
                        });
                        $(this).fadeIn(250);
                        if($('.type').val() == 'spot'){
                            dmap(data,1);
                        }
                    });
                }
            });
    }
}

function search_all_header($this){
     var url = '/accounts/list_users/';

        var field_value = $('.search_field').val();
        if($('.search_field').val().length==0)
            field_value = '';

            $.ajax({
                type: "POST",
                url: url,
                dataType: 'json',
                data: {
                    'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                    'field_value': field_value
                }
            }).done(function(data) {

                    $('.d-results').empty();
                    if(data){
                        var last_count = 0;
                        $.each(data,function(i){
                            var obj = data[i];
                            var count = 1;
                            var text = '';
                            if(i == "users" & Object.keys(data['users']).length>0)
                                text = 'Personas';
                            if(i == "author" & Object.keys(data['author']).length>0)
                                text = 'Autores';
                            if(i == "org" & Object.keys(data['org']).length>0)
                                text = 'Organizaciones';
                            if(i == "group" & Object.keys(data['group']).length>0)
                                text = 'Grupos';
                            if(i == "spot" & Object.keys(data['spot']).length>0)
                                text = 'Spots';
                            if(i == "list" & Object.keys(data['list']).length>0)
                                text = 'Listas';
                            if(i == "title" & Object.keys(data['title']).length>0)
                                text = 'Títulos';
                            if(Object.keys(data[i]).length>0)
                                $('.d-results').append('<a class="user_profile person" >' + text + '</a>');
                            $.each(obj,function(i2){
                                if(count<=3){
                                    var href = '';
                                    var name_user = '';
                                    var src = '/static/img/create.png';

                                    if(i == "users"){
                                        href = '/accounts/users/profile/' + obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = '/static/media/users/' + obj[i2].id +
                                                '/profile/' + obj[i2].picture;
                                        name_user = obj[i2].name + ' ' + obj[i2].name_2;
                                    }
                                    if(i == "author"){
                                        href = '/qro_lee/profile/author/' + obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = obj[i2].picture;
                                        name_user = obj[i2].name;
                                    }
                                    if(i == "org"){
                                        href = '/qro_lee/entity/organization/' +
                                            obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = '/static/media/users/' + obj[i2].id_user +
                                                '/entity/' + obj[i2].picture;
                                        name_user = obj[i2].name;
                                    }
                                    if(i == "group"){
                                        href = '/qro_lee/entity/group/'+ obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = '/static/media/users/' + obj[i2].id_user +
                                                '/entity/' + obj[i2].picture;
                                        name_user = obj[i2].name;
                                    }
                                    if(i == "spot"){
                                        href = '/qro_lee/entity/spot/' + obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = '/static/media/users/' + obj[i2].id_user +
                                                '/entity/' + obj[i2].picture;
                                        name_user = obj[i2].name;
                                    }
                                    if(i == "list"){
                                        href = '/qro_lee/profile/list/' + obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = '/static/media/users/' + obj[i2].id_user +
                                                '/list/' + obj[i2].picture;
                                        name_user = obj[i2].name;
                                    }
                                    if(i == "title"){
                                        href = '/qro_lee/profile/title/' + obj[i2].id;
                                        if(obj[i2].picture!='')
                                            src = obj[i2].picture;
                                        name_user = obj[i2].name;
                                    }

                                    var a = $('<a title="' + name_user + '" href="' +
                                        href + '" class="user_profile"></a>');
                                    a.append('<img src="' + src + '" class="img_user" />');
                                    var name = $('<span class="span_name_user" ></span>');
                                    name.append(truncText(name_user,20));
                                    a.append(name);
                                    $('.d-results').append(a);
                                }
                                count++;
                            });

                            last_count++;
                            if(last_count == Object.keys(data).length)
                                $('.d-results').append('<a class="user_profile person link_search_all" ' +
                                    'href="/qro_lee/advanced_search/" >ver todos</a>');
                        });

                    }
                    $('.d-results').fadeIn(250);

                });
}

function load_img_profile(){

    $.ajax({
        type: "POST",
        async: false,
        url: '/qro_lee/load_picture/',
        data: {
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val()
        },
        dataType: 'json'
    }).done(function(data){
            var src_picture = '/static/img/create.png';
            if(data.picture!='')
                src_picture = '/static/media/users/' +
                    data.id_user + '/profile/' + data.picture;

            $('.img_profile_mini').attr('src',src_picture);
        });
}

function search_pages(){

    var id_user = parseInt($('.profile_id_user').val());
    var id_user_sesion = parseInt($('.sesion_user').val());
    field_value = $('.field_pag').val();
    query = {
        'name__icontains':field_value,
        'user__in':JSON.stringify([id_user]),
        'status':1
    }
    fields = ['name','id','coment','user'];
    and = 1;
    join = {
        'tables':{
            0: JSON.stringify(['auth.User'])
        },
        'quieres':{
            0: JSON.stringify(['id'])
        },
        'fields':{
            0: JSON.stringify(['id','username'])
        }
    }
    join = JSON.stringify(join);

    var search = {
        'type': 'account.Page',
        'fields': JSON.stringify(fields),
        'value': JSON.stringify(query),
        'and': and,
        'join': join
    }
    search = JSON.stringify(search);
    var csrf = $('.csrf_header').find('div input').val();
    var data = advanced_search(search, csrf);

    var overview = $('.overview_page');
    overview.fadeOut(200);
    overview.empty();
    if('response' in data)
        delete data['response'];

    $.each(data,function(i){

        var href = '/qro_lee/user/' + id_user + '/page/'+ data[i].id;
        div = $('<div class="item_list d-list_'+data[i].id+'" ></div>');
        a_wrapper = $('<a href="' + href + '"></a>');
        span = $('<span class="wrapper_list" ></span>');
        a_wrapper.append(span);
        input_name = $('.<input class="name_list" type="hidden" value="'+data[i].name+'">');
        input_id_rel = $('.<input class="id_list" type="hidden" value="'+data[i].id+'">');
        div.append(input_name);
        div.append(input_id_rel);
        div.append(a_wrapper);
        img = $('<img class="img_size_all" src="/static/img/create.png"/>');
        span_title = $('<span class="grid-9 no-margin"></span>');
        div.append(span_title);
        a_title =  $('<a title="' + data[i].name + '" href="' +
            href + '" class="title alpha title_book"></a>');
        a_title.append(truncText(data[i].name,26));
        span_btn = $('<span class="grid-4 no-margin"></span>');
        a_edit = $('<a href="/accounts/users/update_page/'+data[i].id+'">' +
            '<span class="green_btn size_btn_edit">Editar</span></a>')
        span_del = $('<span class="pink_btn size_btn_edit message_alert">-'+
            '<input class="type_message" type="hidden" value="delete_page"></span>'+
            '</span>');

        if(id_user == id_user_sesion){
            span_btn.append(a_edit);
            span_btn.append(span_del);
        }
        div.append(span_btn);
        span_by = $('<span class="grid-10 no-margin"></span>');
        text_by = $('<span class="d-text_opacity">De </span>');
        user = $('<a href="/accounts/users/profile/' + id_user + '">' +
            '<span class="place_pink">'+ data[i].user +'</span></a>');
        span_by.append(text_by);
        text_by.append(user);
        div.append(span_by);
        p_text = $('<span class="d-text_list grid-13 no-margin" ></span>');
        img_coment = $('<div></div>');
        img_coment.append(data[i].coment);
        var img_exist = false;
        var count_img = 0;
        $.each(img_coment,function(){
            if($(this).find('img').length>0 & !img_exist){
                span.append('<img class="img_size_all" src="' +
                    $(this).find('img').attr('src') + '"/>');
                img_exist = true;
            }
        });

        if(!img_exist)
            span.append(img);

        var item_html = (data[i].coment).replace(/<\/?[^>]+>/gi, '');
        p_text.append(truncText(item_html,580));
        span_title.append(a_title);
        div.append(p_text);
        overview.append(div);

    });
    overview.fadeIn(200);
    if($('#scrollbar1').length>0)
        $('#scrollbar1').tinyscrollbar();

    show_dialog();
}

$(document).click(function(){
    $('.search_result').fadeOut(250);
    if(!set_act)
        $('.sub-menu-h').fadeOut(250);
    set_act = false;
    if(!men_1)
        $('.sub-menu').fadeOut(250);
    men_1 = false;
    if(!combo_act)
        $('.value_sel').fadeOut(200);
    combo_act = false;

});

function add_rate($this){
    $.ajax({
        type: "POST",
        url: '/registry/add_rate/',
        data: {
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
            'grade': parseInt($this.find('.grade').val()) + 1 ,
            'type': $this.find('.type').val(),
            'element_id': $this.find('.element_id').val()
        },
        dataType: 'json'
    }).done(function(data){
            div = $('.container_rate').fadeOut(300);
            div.empty();
            count_rate = parseFloat(data.count_grade);
            count =  parseInt(data.count_grade);
            if((count_rate-count)<=0.5)
                count = count_rate - (count_rate-count);
            else
                count++;

            for(var x = 0;x<5;x++){
                span_str = $('<span class="rate"></span>');
                div.append(span_str);
                if(x<data.my_count_grade){
                    span_str.append('<img src="/static/img/starUser.png" />');
                }else{
                    span_str.append('<img src="/static/img/backgroundStar.png" />');
                }
                span_str.append('<input class="grade" type="hidden" value="'+ x + '"/>');
                span_str.append('<input class="type" type="hidden" value="'+data.type+'"/>');
                span_str.append('<input class="element_id" type="hidden" value="'+data.element_id+'"/>');

            }
            span_count = $('<span class="text_rate border_right"> Total: ' + parseFloat(data.count_grade).toFixed(1) + ' </span>');
            span_vote = $('<span class="text_rate border_right"> ' + data.count + ' votaciones</span>');
            span_my_vote = $('<span class="text_rate "> mi voto: ' +
                data.my_count_grade +'</span>');
            div.append(span_count);
            div.append(span_vote);
            div.append(span_my_vote);
            div.fadeIn(300);
            $('.rate').click(function(){
                add_rate($(this));
            });
        });
}