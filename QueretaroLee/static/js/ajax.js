function truncText (text, maxLength, ellipseText){
        ellipseText = ellipseText || '&hellip;';

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
        return (lastCharPosition ? text.substr(0, lastCharPosition+1) : '') + ellipseText;
}

function populateCal(curr_month,$item){

    if((curr_month)>0){

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
                    'csrfmiddlewaretoken': $('.sidebar-b div input[type=hidden]').val(),
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

                            if($ditem.hasClass('item_'+i)){
                                $ditem.find('.date').html(days[e[2]-1]+' '+e[1]);
                                var picture_url = window.location.origin+'/static/media/users/'+
                                    e[8]+'/event/'+e[3];
                                var d_name = e[0];
                                d_name = d_name.replace(/\s/g,'');
                                $ditem.find('.d-link_event').attr('href','/qro_lee/events/'
                                    + d_name + "_" + e[6]);
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
                                var edit_url = '/registry/edit/event/'+name[0]+'_'+e[6];
                                if($ditem.find('.green_btn').length > 0)
                                    $ditem.find('.green_btn').attr('href', edit_url);
                            }

                            if((counter+1) == length){
                                $('.sidebar-a .overview *[class*="item_"]').fadeIn(300,function(){
                                    if($('div').hasClass('events')){
                                        $('.sidebar-a #scrollbar1').tinyscrollbar({sizethumb:80});
                                    }else{
                                        $('.sidebar-a #scrollbar1').tinyscrollbar();
                                    }
                                }).css('display','block');
                            }

                            counter++;
                        });
                    });

                    $('.d-not_found').remove();
                    if(counter==0){
                        text_no_found();
                    }


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
            'csrfmiddlewaretoken': $ele.find('div input').val(),
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
            'csrfmiddlewaretoken': $ele.find('div input').val(),
            'user_email': userEmail,
            'entity': entity
        }
    }).done(function(data) {
            $.each(data,function(index){
                user = data[index];
                $.each(user,function(i){
                    var span = $item.clone();
                    span.removeClass('affiliate margin').addClass('affiliate user_'+user[i][1]);

                    if(span.hasClass('user_'+user[i][1])){
                        var img_url = '/static/media/users/'+user[i][1]+'/'+user[i][0];
                        span.find('.name').html(user[i][2]);
                        span.find('.user-id').val(user[i][1]);
                        span.find('img').attr('src',img_url);
                        span.find('.since').html('Se únio hace '+user[i][3]+' meses');
                        span.appendTo($parent);
                        span.fadeIn(300);
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
                });
                   $('.remove').click(function(){
                        if(!$(this).hasClass('add')){
                            var user = $(this).parent().parent().find('input').val();
                            var name = $(this).parent().find('.name').html();
                            $('.alert-message').fadeIn(300,function(){
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
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
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



function search_api(csrf, query){
    /*
    query = {
         'q': JSON.stringify($.trim($('.advanced_filter .search').val()).split(' ')),
         'start_index': {
            0: 0 (para hacer paginacion en los libros, autores no se puede hacer paginacion )
         },
         'type': {
            0: type (account.title o account.author)
         }
     }
     api = search_api(csrf, query);
     */
    var ret = null;
    $.ajax({
        type: "POST",
        async: false,
        url: '/qro_lee/search_api/',
        data: {
            'csrfmiddlewaretoken': csrf,
            'search': JSON.stringify(query)
        },
        dataType: 'json'
    }).done(function(data){
        ret = data;
    });
    return ret;
}

$(document).ready(function(){

    var date = new Date();
    curr_month = date.getMonth();
    $('.sidebar-a .month').html(months[curr_month]);
    var $item = $('.sidebar-a .item').clone();

    $('.heading .search span.search_btn').click(function(){
        if(content_search_entity){
            if($(this).parent().find('.type').val()=='Event'){

                $('.sidebar-a .item').each(function(){
                    $(this).remove();
                });
                populateCal(100,$item);

            }else{
                var url = '/qro_lee/entities/'+
                $(this).parent().find('.type').val()+'/';

                var field_search;
                if($('.alert-message').length > 0 ){
                    $('.load').find("*[class*='user_']").each(function(){
                        $(this).remove();
                    });
                    var $email = $('.alert-message input.user').val(
                        $(this).parent().find('input.search').val());
                    var entity = $('.alert-message input.entity').val();
                    findUser($('.alert-message'), $email.val(), entity,$('.load.add'));
                    return;
                }else if($(this).parent().find('input[type=text]').val().length>=1){
                    field_search = $(this).parent().find('input[type=text]').val();
                }else{
                    field_search = "*";
                }

                $.ajax({
                type: "POST",
                url: url,
                dataType: 'json',
                data: {
                    'csrfmiddlewaretoken': $(this).parent().find('div input').val(),
                    'field_search_entity': field_search
                }
                }).done(function(data) {

                        if(data){

                            var no_found = 0;
                            $.each(data,function(index){
                                var inde = data[index];
                                $.each(inde,function(index2){
                                    no_found++;
                                });
                            });

                            var counter = $('.overview .grid-7').size()-1;
                            $('.overview .grid-7').each(function(){
                                if(counter == 0){
                                $(this).fadeOut(300,function(){
                                    $.each(data,function(index){
                                        entity_obj = data[index];
                                        $.each(entity_obj,function(i){
                                            var img_src;
                                        if(entity_obj[i].type=='spot'){

                                            div = $('<div class="grid-7 omega d-spot"></div>');
                                            var d_name = entity_obj[i].name;
                                            d_name = d_name.replace(/\s/g,'');
                                            var href = '/qro_lee/entity/organization/'+
                                                d_name+'_'+entity_obj[i].id+'/';
                                            a = $('<a href="' + href +
                                                '" class="wrapper d-wrapperspot"></a>');
                                            divtext = $('<div class="d-text_spot "></div>');
                                            if(entity_obj[i].picture != '')
                                                img_src = '/static/media/users/'+
                                                    entity_obj[i].user + '/entity/'
                                                    + entity_obj[i].picture;
                                            else
                                                img_src ='';
                                            img = $('<img src="'+img_src+'" atr="" >');
                                            href = '/registry/edit/'+d_name+'_'+entity_obj[i].id+'/';
                                            btn = $('<a class="brown_btn" href="' + href + '">Editar</a>');
                                            div.append(a.append(img));

                                            if(entity_obj[i].user==$('.id_user').val()){
                                                div.append(a.append(btn));
                                            }
                                            //h3 = $('<h3 class="title alpha grid-4"></h3>');
                                            a2 = $('<a href="' + href + '" class="title ' +
                                                'alpha grid-4"></a>');
                                            div.append(a2);
                                            p = $('<p></p>');
                                            div.append(divtext.append(p));
                                            $('.overview').append(div);
                                            div.find('.title').html(entity_obj[i].name);
                                            div.find('p').html(truncText(entity_obj[i].address,180)+
                                                '<br>Teléfonos:442 290 8989<br>' +
                                                '<a class="d-pink" href="">Biblioteca</a>');
                                            div.fadeIn(300);

                                        }else{

                                            div = $('<div class="grid-7 omega">' +
                                                '</div>');
                                            var d_name = entity_obj[i].name;
                                            d_name = d_name.replace(/\s/g,'');
                                            var href = '/qro_lee/entity/organization/'+
                                                d_name+'_'+entity_obj[i].id+'/';

                                            a = $('<a href="'+ href + '" class="wrapper">' +
                                                '</a>');

                                            if(entity_obj[i].picture != '')
                                                img_src = '/static/media/users/' +
                                                    entity_obj[i].user+'/entity/'
                                                    + entity_obj[i].picture;
                                            else
                                                img_src ='/static/img/create.png';

                                            img = $('<img src="'+img_src+'" atr="" >');
                                            href_edit = '/registry/edit/'+d_name+'_'+entity_obj[i].id+'/';
                                            btn = $('<a class="brown_btn" href="' +
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
                                                description,180));                                                                                        div.find('.img')
                                            div.fadeIn(300);
                                        }
                                        });
                                    });
                                });
                            }else
                                    $(this).fadeOut(300,function(){
                                        $(this).remove();
                                    });
                                counter--;
                            });
                        }
                        $('.d-not_found').remove();
                        if(no_found==0){
                            text_no_found();
                        }
                });
            }
        }
    });

    $('.search_list').click(function(){

        var url = '';
        if($('.type').val()=="List"){
             url = '/list/';
        }
        if($('.type').val()=="Title"){
             url = '/book/titles/';
        }
        if($('.type').val()=="Author"){
             url = '/book/authors/';
        }

         $.ajax({
            type: "POST",
            url: '/qro_lee'+url,
            dataType: 'json',
            data: {
                'csrfmiddlewaretoken': $(this).parent().find('div input').val(),
                'field_value':$('.field_list').val()
            }
            }).done(function(data) {
                if(data){

                    $('.overview').fadeOut(250);
                    $('.overview').empty();
                    var empty = true;

                    if($('.type').val()=="List"){

                    $.each(data,function(i){
                        empty = false;
                        div = $('<div class="item_list grid-14 no-margin" ></div>');
                        span = $('<span class="wrapper_list" ></span>');
                        div.append(span);
                        img = $('<img src="/static/media/users/1/list/' +
                            data[i].picture + '"/>');
                        span.append(img);
                        span_data = $('<span class="container_data grid-12 no-margin">'+
                            '</span>');
                        a_title =  $('<a href="/qro_lee/entity/group/wime8_3/"'+
                        'class="title alpha title_book grid-10"></a>');
                        a_title.append(data[i].name);
                        p_by = $('<p class="d-text_list d-text_opacity" >'+
                                'Lista con 20 libros creada por </p>');
                        p_by.append('<span class="d-pink">' + data[i].user +
                            '</span>');
                        p_text = $('<p class="d-text_list" ></p>');
                        p_text.append(truncText(data[i].description,300));
                        span_data.append(a_title);
                        span_data.append(p_by);
                        span_data.append(p_text);
                        div.append(span_data);
                        $('.overview').append(div);

                  });
                  }
                  if($('.type').val()=='Title'){
                    $.each(data,function(i){
                        empty = false;
                        div = $('<div class="grid-5 fleft ' +
                            'results no-margin"></div>');
                        div_item = $('<div class="item"></div>');
                        span = $('<span class="wrapper wrapper_book fleft ' +
                            'no_margin-right"></span>');
                        div_item.append(span);
                        img = $('<img src="" alt=""/>');
                        span.append(img);
                        h3 = $('<h3 class="title title_book margin_left ' +
                            'no-margin grid-2 fleftt"></h3>');
                        h3.append(truncText(data[i].title,11));
                        div_item.append(h3);
                        p = $('<p class="fleft margin_left no-margin grid-2 ">' +
                            'Edgar <span>La Biblia</span></p>');
                        div_item.append(p);
                        div.append(div_item);
                        $('.overview').append(div);

                    });
                  }

                  if($('.type').val()=='Author'){
                    $.each(data,function(i){
                        empty = false;
                        div = $('<div class="grid-7 alpha">' +
                            '</div>');
                        span = $('<span class="wrapper ' +
                            'border_author "><span>');
                        img = $('<img alt="" src="/static/img/foto.jpg"/>');
                        div.append(span);
                        span.append(img);
                        a = $('<a class="title alpha grid-4"></a>');
                        a.append(data[i].name);
                        p_text = $('<p class="grid-4 no-margin"></p>');
                        p_titles = $('<p class="title_author grid-4 no-margin">' +
                            '</p>');
                        div.append(a);
                        div.append(p_text);
                        div.append(p_titles);
                        p_titles.append("23 Titulos");
                        $('.overview').append(div);

                    });
                  }

                    if(empty=true){

                    }

                    $('.overview').fadeIn(250);

                }else{
                    $('.overview').fadeOut(250);
                }
            });
    });

    $('.search_button').click(function(){

            var url = '/accounts/list_users/';
            $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            data: {
                'csrfmiddlewaretoken': $(this).parent().find('div input').val(),
                'field_value':$('.search_field').val()
            }
            }).done(function(data) {
                    $('.results').empty();
                    $('.results').append('<a class="user_profile person" >Personas</a>');
                    if(data){
                        $.each(data,function(i){
                            var obj = data[i];
                            $.each(obj,function(i2){

                                var href = '';
                                var src = '';

                                if(i=="users"){
                                    href = '/accounts/users/profile/'+obj[i2].id;
                                    src = '/static/media/users/1/profile/gandhi-logo.jpg';
                                }else{
                                    href = '/accounts/users/profile/'+obj[i2].id;
                                    src = '/static/media/users/1/profile/gandhi-logo.jpg';
                                }

                                var a = $('<a href="' + href + '" class="user_profile"></a>');
                                a.append('<img src='+src+' class="img_user" />');
                                var name = $('<span class="span_name_user" ></span>')
                                var name_user = obj[i2].first_name +' '+ obj[i2].last_name;
                                name.append(truncText(name_user,23));
                                a.append(name);
                                $('.results').append(a);
                            });
                            if(i=="users")
                                $('.results').append('<a class="user_profile person" >Autores</a>');

                        });

                    }
                    $('.results').fadeIn(250);

            });
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
                'csrfmiddlewaretoken': $('.sidebar-b div input[type=hidden]').val(),
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
                        if(month <=3){
                            var $table = $('.sidebar-b table');
                            $table.find('.month:odd').each(function(index){
                                if((month-1) == index){
                                    $table = $(this).parent().parent().parent();
                                    //console.log($table.html());
                                    $table.find('tr').each(function(){
                                        $(this).find('td').each(function(){
                                            if($(this).html() == day)
                                                $(this).addClass('active-event');
                                        });
                                    });
                                }
                            });

                        }else if(month <=6){
                            var $table = $('.sidebar-b table');
                            $table.find('.month:odd').each(function(index){
                                if((month-1) == index){
                                    $table = $(this).parent().parent().parent();
                                    //console.log($table.html());
                                    $table.find('tr').each(function(){
                                        $(this).find('td').each(function(){
                                            if($(this).html() == day)
                                                $(this).addClass('active-event');
                                        });
                                    });
                                }
                            });

                        }else if(month <=9){
                            var $table = $('.sidebar-b table');
                            $table.find('.month:odd').each(function(index){
                                if((month-1) == index){
                                    $table = $(this).parent().parent().parent();
                                    //console.log($table.html());
                                    $table.find('tr').each(function(){
                                        $(this).find('td').each(function(){
                                            if($(this).html() == day)
                                                $(this).addClass('active-event');
                                        });
                                    });
                                }
                            });
                        }else{
                            var $table = $('.sidebar-b table');
                            $table.find('.month:odd').each(function(index){
                                if((month-1) == index){
                                    $table = $(this).parent().parent().parent();
                                    //console.log($table.html());
                                    $table.find('tr').each(function(){
                                        $(this).find('td').each(function(){
                                            if($(this).html() == day)
                                                $(this).addClass('active-event');
                                        });
                                    });
                                }
                            });
                        }
                        if(count == (len-1)){
                            populateCal(curr_month,$item);

                        }
                        count++;
                    });
                });

        });

        $('.sidebar-b .controller span').click(function(){
            $('.sidebar-a .item').remove();

                if($(this).hasClass('next')){
                    if(curr_month<11 ){
                curr_month++;
                    }
                }else{

                    if(curr_month>0 ){
                curr_month--;
                    }
                }
            $('.sidebar-a .month').html(months[curr_month]);
            populateCal(curr_month,$item);
        });
    }



    if($('#d-map').length>0){
            $.ajax({
                type: "POST",
                url: '/qro_lee/entities/spot/',
                data: {
                    'csrfmiddlewaretoken': $('.search div input[type=hidden]').val(),
                    'post': 2
                },
                dataType: 'json'
            }).done(function(data){
                dmap(data,1);

            });
    }

    if($('#map').length>0){
            var name_event = ""+$('.name_event').val();
            name_event = name_event.replace(/\s/g,'');
            var id_event = $('.id_event').val();
            $.ajax({
                type: "POST",
                url: '/qro_lee/events/'+name_event+'_'+id_event+'/',
                data: {
                    'csrfmiddlewaretoken': $('.search div input[type=hidden]').val(),
                    'post': 1
                },
                dataType: 'json'
            }).done(function(data){
                    initialize(data['lat'],data['long']);
            });
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
        $(this).parent().fadeOut(300,removeUser($(this).parent(), user, 1, $('.alert-message input.entity').val()));
    });
    $('.entity .nav .btn:eq(0)').click(function(){
        $('.admin').find("*[class*='user_']").each(function(){
            $(this).remove();
        });
        findUser($('.alert-message'), '-1',
            $('.alert-message').find('.entity').val(), $('.admin'));
    });

    $('.all_book').click(function(){
        if($(this).parent().parent().find('.title_show').is(':visible'))
            $(this).parent().parent().find('.title_show').fadeOut(250);
        else
            $(this).parent().parent().find('.title_show').fadeIn(250);


    });
    $('.rate').click(function(){
         $.ajax({
                type: "POST",
                url: '/registry/add_rate/',
                data: {
                    'csrfmiddlewaretoken': $('.search div input[type=hidden]').val(),
                    'grade': parseInt($(this).find('.grade').val()) + 1 ,
                    'type':$(this).find('.type').val(),
                    'element_id':$(this).find('.element_id').val()
                },
                dataType: 'json'
            }).done(function(data){

                div = $('.container_rate').fadeOut(250);
                div.empty();
                count_rate = parseFloat(data.count_grade);
                count =  parseInt(data.count_grade);
                if((count_rate-count)<=0.6)
                   count = count_rate - (count_rate-count);
                else
                   count++;

                for(var x = 0;x<5;x++){

                    if(x<data.my_count_grade){
                        div.append('<img src="/static/img/start_black.png" />');
                    }else{
                        div.append('<img src="/static/img/start.png" />');
                    }
                }
                span_count = $('<span class="text_rate border_right"> Total: ' + parseFloat(data.count_grade).toFixed(1) + ' </span>');
                span_vote = $('<span class="text_rate border_right"> ' + data.count + ' votaciones</span>');
                span_my_vote = $('<span class="text_rate "> mi voto: ' +
                    data.my_count_grade +'</span>');
                div.append(span_count);
                div.append(span_vote);
                div.append(span_my_vote);
                div.fadeIn(250);
            });
    });

});

$(document).click(function(){
    $('.search_result').fadeOut(250);
});

function delete_title($btn_delete){
        $.ajax({
        type: "POST",
        url: '/registry/delete_title/',
        data: {
        'csrfmiddlewaretoken': $('.content  div input[type=hidden]').val(),
        'id_title':$btn_delete.find('.id_title').val(),
        'type':$btn_delete.find('.type_list').val()
        },
        dataType: 'json'
        }).done(function(data){
           $btn_delete.fadeOut(250,function(){
                $(this).remove();
           });
        });

}

function delete_list($btn_delete){
        $.ajax({
        type: "POST",
        url: '/registry/delete_list/',
        data: {
        'csrfmiddlewaretoken': $('.content  div input[type=hidden]').val(),
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

    $.ajax({
        type: "POST",
        url: '/registry/add_titles_my_list/',
        data:{
            'csrfmiddlewaretoken': csrf,
            'list':JSON.stringify(title_ids),
            'id_list':id_list,
            'type':'T'
        },
        dataType: 'json'
    }).done(function(data) {

        return data;

    });
}
