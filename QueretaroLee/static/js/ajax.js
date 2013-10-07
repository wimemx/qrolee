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
                            var edit_url = '/registry/edit/event/'+name[0]+'_'+e[6];
                            if($ditem.find('.green_btn').length > 0){
                                $ditem.find('.date').html(e[1]+' de '+months[e[9]-1]);
                                $ditem.find('.green_btn').attr('href', edit_url);
                            }
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

    if($('.img_profile_mini').length>0){

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
        var text = '';
        if($('.type').val()=="List"){
            url = '/list/';
            text = ' Listas ';
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
        my_list_type = parseInt($(this).parent().find('.my_list_typ').val());

         $.ajax({
            type: "POST",
            url: '/qro_lee'+url,
            dataType: 'json',
            data: {
                'csrfmiddlewaretoken': csrf,
                'field_value':$('.field_list').val(),
                'type_list':my_list_type
            }
            }).done(function(data) {

                if(data){

                    var overview;
                    if(my_list_type==0){
                        overview = $('.my_items_list');
                    }else{
                        overview = $('.overview');
                    }

                    overview.fadeOut(250);
                    overview.empty();

                    if($('.type').val()=="List"){

                    $.each(data,function(i){
                        var href = '/qro_lee/profile/list/'+ data[i].id;
                        div = $('<div class="item_list grid-15 no-margin" ></div>');
                        a_wrapper = $('<a href="' + href + '"></a>');
                        span = $('<span class="wrapper_list" ></span>');
                        a_wrapper.append(span);
                        div.append(a_wrapper);
                        img = $('<img class="img_size_all" src="/static/media/users/'
                            + data[i].id_user + '/list/' +
                            data[i].picture + '"/>');
                        span.append(img);
                        span_data = $('<span class="container_data grid-13 no-margin">'+
                            '</span>');
                        if(my_list_type==0){

                            span_title = $('<span class="grid-4 no-margin"></span>');
                            span_btn = $('<span class="container_btn grid-4 no-margin"></span>');
                            edit_list = $('<a href="/registry/edit_list/' + data[i].type +
                                '/' + data[i].id + '"></a>');
                            span_save = $('<span class="green_btn size_btn_edit marg_edit" >Editar</span>')
                            del_list = $('<span class="pink_btn size_btn_edit message_alert" >-</span>');
                            edit_list.append(span_save);
                            span_btn.append(edit_list);
                            span_btn.append(del_list);
                            span_data.append(span_title);
                            span_data.append(span_btn);

                        }else{
                            span_title = $('<span class="grid-9 no-margin"></span>');
                            span_data.append(span_title);
                        }

                        a_title =  $('<a href="' + href + '" class="title alpha title_book"></a>');
                        a_title.append(data[i].name);
                        if(my_list_type==0)
                            p_stars = $('<span class="fright"></span>');
                        else
                            p_stars = $('<span class="grid-4 no-margin"></span>');

                        span_stars = $('<span class="fright" ></span>');
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

                        p_by = $('<span class="d-text_list grid-13 d-text_opacity no-margin" >'+
                                'Lista con ' + data[i].count +' ' + type + ' creada por </span>');
                        text_by = $('<a href="/accounts/users/profile/' +
                            data[i].id_user + '" class="d-pink"></a>');
                        text_by.append(data[i].user);
                        p_by.append(text_by);
                        p_text = $('<span class="d-text_list grid-13 no-margin" ></span>');
                        p_text.append(truncText(data[i].description,520));
                        span_title.append(a_title);
                        p_stars.append(span_stars);
                        span_data.append(p_stars);
                        span_data.append(p_by);
                        span_data.append(p_text);
                        div.append(span_data);
                        overview.append(div);

                  });
                  }
                  if($('.type').val()=='Title'){

                    $.each(data,function(i){
                        href = '/qro_lee/profile/title/'+data[i].id;
                        div = $('<div class="grid-5 fleft results margin_bottom' +
                            ' no-margin"></div>');
                        div_item = $('<div class="item"></div>');
                        a_wrapper = $('<a href="' + href + '" ></a>');
                        span = $('<span class="wrapper wrapper_book fleft ' +
                            'no_margin-right"></span>');
                        a_wrapper.append(span);
                        div_item.append(a_wrapper);
                        img = $('<img class="img_size_all" src="' + data[i].picture + '" alt=""/>');
                        span.append(img);
                        a_title = $('<a href="' + href + '" ></a>');
                        h3 = $('<h3 class="title title_book margin_left no-margin' +
                            ' grid-2 fleftt"></h3>');
                        h3.append(truncText(data[i].title,8));
                        a_title.append(h3);
                        div_item.append(a_title);
                        var name_author = data[i].author;
                        var href_a = '';

                        if(data[i].author != 'autor anonimo'){
                            name_author = name_author.substring(0,15);
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
                        p_stars = $('<p class="fleft margin_left no-margin grid-2"></p>');
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

                    });
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
                        a = $('<a href="' + href + '" class="title alpha grid-4"></a>');
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

                    if(Object.keys(data).length==0){
                        div = $('<div class="grid-14  no_resuls">No hay ' + text + ' </div>');                        $('.overview').append(div);
                    }

                    $('#scrollbar1').tinyscrollbar();
                    overview.fadeIn(250);

                }else{
                    overview.fadeOut(250);
                }
            });
    });

    $('.search_button').click(function(){
        if($('.search_field').val().length>0){
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

                    $('.d-results').empty();
                    $('.d-results').append('<a class="user_profile person" >Personas</a>');
                    if(data){
                        console.log(data);
                        $.each(data,function(i){
                            var obj = data[i];
                            var count = 1;
                            $.each(obj,function(i2){
                                if(count<=3){
                                    var href = '';
                                    var src = '';

                                    if(i=="users"){
                                        href = '/accounts/users/profile/'+obj[i2].id;
                                        src = '/static/media/users/'+obj[i2].id+'/profile/'+obj[i2].picture;
                                    }else{
                                        href = '/qro_lee/profile/author/'+obj[i2].id;
                                        src = obj[i2].picture;
                                    }

                                    var a = $('<a href="' + href + '" class="user_profile"></a>');
                                    a.append('<img src='+src+' class="img_user" />');
                                    var name = $('<span class="span_name_user" ></span>')
                                    var name_user = '';
                                    if(i=='users')
                                        name_user = obj[i2].first_name + ' ' + obj[i2].last_name;
                                    else
                                        name_user = obj[i2].first_name;

                                    name.append(truncText(name_user,23));
                                    a.append(name);
                                    $('.d-results').append(a);
                                }
                                count++;
                            });

                            if(i=="users")
                                $('.d-results').append('<a class="user_profile person" >Autores</a>');
                            if(i=="author")
                                $('.d-results').append('<a class="user_profile person link_search_all" ' +
                                    'href="/qro_lee/advanced_search/" >ver todos</a>');


                        });


                    }
                    $('.d-results').fadeIn(250);

                });
        }
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
                        var $table;
                        $table = $('.sidebar-b table');
                        $table.find('.month:odd').each(function(index){
                            if((month-1) == index){
                                console.log($(this).html());
                                $table = $(this).parent().parent().parent();
                                //console.log($table.html());
                                $table.find('tr').each(function(){
                                    $(this).find('td').each(function(){
                                        if($(this).html() == '&nbsp;')
                                            $(this).css({
                                                'background': '#DBC8A2'
                                            })
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
        show_titles($(this));
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
                        div.append('<img src="/static/img/starUser.png" />');
                    }else{
                        div.append('<img src="/static/img/backgroundStar.png" />');
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

    if($('#map').length>0){
        initialize(20,100);

    }

});

$(document).click(function(){
    $('.search_result').fadeOut(250);
});

function delete_title($btn_delete){


        $.ajax({
        type: "POST",
        url: '/registry/delete_title/',
        data: {
        'csrfmiddlewaretoken':$('.csrf_token').find('div input').val(),
        'id_title':$btn_delete.find('.id_title').val(),
        'type':$btn_delete.find('.type_list').val(),
        'type_list':$('.type_my_list').val(),
        'id_list':$btn_delete.find('.id_list_rel').val()
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
        }
        if(data.type == 2){
            var text_date = $this.parent().find('.d-text_opacity');
            var date = data.date;
            date = date.split('-');

            text_date.fadeOut(250,function(){
                text_date.empty();
                text_date.append('añadido el ' + date[2] + ' de ' + months[(date[1]-1)]);
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
