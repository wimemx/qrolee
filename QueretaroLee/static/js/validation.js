var valid_form = false;
$(document).ready(function(){

    $('.pass_match').keyup(function(){
        if($(this).val()!=$('.pass').val()){
            var span = $('<span class="invalid">No coincide tu contraseña</span>');
            $(this).parent().append(span);
            $(this).parent().find('.invalid').fadeIn(300);
        }else{
            $(this).parent().find('.invalid').fadeOut(300,function(){
                $(this).remove();
            });
        }
    });

    $('form').submit(function(e){
        var required = $(this).find('p').find('.required').length;
        var valid = required;
        $(this).find('p').each(function(){
            if(!$(this).hasClass('submit')){
                $(this).find('.invalid').remove();
                if($(this).find('input').hasClass('required') &&
                     $.trim($(this).find('input').val()) == ''){
                        valid--;
                        var span = $('<span class="invalid"></span>');
                        var value = 'Ingrese su ';
                        //console.log($.trim($(this).find('input')).val());
                        if ($.trim($(this).find('input').attr('name')) != 'password_match'){
                            value += $.trim($(this).find('input').attr('name'));
                        }else{
                            value += 'password';
                        }
                        span.html(value);
                        $(this).append(span);
                        $(this).find('.invalid').fadeIn(300);

                }else{
                    $(this).find('[class*="regex_"]').each(function(){
                        var regex_classes = $(this).attr('class').split(' ');
                        var regex_type = '';
                        $.each(regex_classes, function(i){
                            if(regex_classes[i].search('regex_') != -1)
                                regex_type = regex_classes[i];
                        });
                        regex_type = regex_type.split('regex_');
                        regex_type = regex_type[1];
                        var regex_validation = validate_regex($.trim($(this).val()), regex_type);

                        if(!regex_validation[0] && $.trim($(this).val()) != ''){
                            valid--;
                            console.log(regex_validation);
                            var span = $('<span class="invalid"></span>');
                            var value = regex_validation[1];
                            span.html(value);
                            $(this).parent().find('.invalid').remove();
                            $(this).parent().append(span);
                            $(this).parent().find('.invalid').fadeIn(300);
                        }
                    });
                }
            }
        });
        if($.trim($(this).find('.match:eq(0)').val()) !=
            $.trim($(this).find('.match:eq(1)').val())){
            valid--;
            var span = $('<span class="invalid">contraseña incorrecta</span>');
            $('.match').append(span);
            $(this).find('.invalid').fadeIn(300);
        }

        if(valid != required)
            e.preventDefault();
        else
            valid_form = true;
    });


    $('.d-add_book').click(function(){
        var query = {
            'q': JSON.stringify(['Harry','Potter']),
            'start_index':{
                0: 0
            },
            'type': {
            0: 'account.title'
         }
        };
        type = 0;
        if($(this).find('input').val() == 'title')
            type = 1;
        if($(this).find('input').val() == 'list')
            type = 3;

        crsf = $('.csrf_token').find('div input').val();


        type_add_list(crsf, type, query);

    });

    show_dialog();

});


function type_add_list(csrf, id ,query){
    var data = [];
    //'pk__in': JSON.stringify([127, 126])
    if(id==1)
        var _query = {
            'title__icontains':''
        }
    if(id==2)
        var _query = {
            'title__icontains':query
        }

    var fields = ['title', 'cover', 'id'];
    var and = 0;
    var join = {
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

    join = JSON.stringify(join);

    var search = {
        'type': 'account.title',
        'fields': JSON.stringify(fields),
        'value': JSON.stringify(_query),
        'and': and,
        'join': join
    }
        search = JSON.stringify(search);

        data.push(advanced_search(search, csrf));

        if(id==2){
            query = query.split(" ");
            var query = {
                'q': JSON.stringify(query),
                'start_index':{
                    0: 0
                },
                'type': {
                    0: 'account.title'
                }
            };
            data.push(search_api(crsf, query));
        }


        if(id==1)
            dialog_titles(csrf,data,1);
        if(id==2)
            list_title(csrf,data,$('.dialog_text'),3);
        if(id==3)
            dialog_titles(csrf,data,2);
}

function show_dialog(){
    $('.message_alert').click(function(e) {
        $('.dialog-confirm').empty();
        span_text = $('<span></span>');
        var href = '';
        var type_list = 0;

        if($('.type').val()=="group"){

            text = 'Para poder ser miembro tu solicitud sera enviada';
            p_text = $('<p class="p_text_dialog">' + text + '</p>');
            span_text.append(p_text);
            href = 'href="/registry/join_entity/'+$('.d-entity_id').val()+'"';
        }

        console.log($('.type').val());

        if($('.type').val()=="List"){
            var type = $(this).find('.type_message').val();

            if(type=="out_group"){

                var group = $(this).parent().find('.name').val();
                group = group.split("_");
                text = '¿ Estás seguro de que deseas abandonar el grupo de ' +
                    group[0] + ' ?';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
                href = 'href="/registry/unjoin_entity/'+ $(this).parent().
                    find('input').val()+'"';
            }

            if(type=="add_genre"){

                text = 'Añadir un nuevo género favorito';
                text2 = 'Selecciona tus géneros favoritos';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
                span_text.append(p_text);
                span_text.append(p_text2);
                href = 'href="/registry/add_genre/"';
            }

            if(type =="delete_title_list"){

                name_title = $(this).parent().parent().find('.name_title').val();
                type_list = parseInt($(this).parent().parent().find('.type_list').val());
                text = 'Se eliminará ' + name_title + ' de tus lista';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);

            }

            if(type=="delete_title"){

                name_title = $(this).parent().parent().find('.name_title').val();
                type_list = parseInt($(this).parent().parent().find('.type_list').val());
                list = '';
                if(type_list==0){
                    list = 'favoritos';
                }
                if(type_list==1){
                    list = 'leídos';
                }
                if(type_list==2){
                    list = 'por leer';
                }
                text = 'Se eliminará ' + name_title + ' de tus libros ' + list;
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);

            }
            if(type=="edit_read"){
                name_title = $(this).parent().parent().find('.name_title').val();
                text = 'Editar libro leído';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
                text2 = ' Fecha en que leíste ' + name_title;
                p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
                span_text.append(p_text2);
                span_text.append('<input type="text" class="fright hour-init"/>');
            }
            if(type=="delete_list"){
                name = $(this).parent().parent().find('.name_list').val();
                id_list = $(this).parent().parent().find('.id_list').val();
                text = '¿ Estás seguro que deseas eliminar ' + name + ' ?';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
            }
        }
        if($('.type').val()=="account"){
            text = 'Cerrar cuenta';
            text2 = '¿Estás seguro que deseas eliminar tu cuenta de ' +
                'Querétaro Lee ? Esta acción no se puede deshacer';
            p_text = $('<p class="p_text_dialog">' + text + '</p>');
            p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
            span_text.append(p_text);
            span_text.append(p_text2);

            href = 'href="/accounts/delete_user/"';
        }

        div_closet = $('<span class="dialog_closet"></span>');
        div_text = $('<div class="dialog_text grid-6 no-margin"></div>');
        btn_cancel = $('<span class="dialog_btn_cancel dialog_btn">Cancelar</span>');
        btn_acept = $('<a class="dialog_btn green_btn" ' + href + ' >Aceptar</a>');
        container_btn = $('<div class="dialog_container_btn"></div>');
        container_btn.append(btn_acept);
        container_btn.append(btn_cancel);
        $('.dialog-confirm').append(div_text);
        div_text.append(div_closet);
        div_text.append(span_text);

        if(($(this).find('.type_message').val())=='add_genre'){
            get_genre(div_text);
        }else{
            div_text.append(container_btn);
        }
        if(($(this).find('.type_message').val())=='delete_title'){
            var id_title = $(this).parent().parent().find('.id_title').val();
            btn_acept.click(function(){
                console.log(type_list);
                container_item = '';
                if(type_list==0){
                    container_item = 'book_favorite';
                }
                if(type_list==1){
                    container_item = 'book_read';
                }
                if(type_list==2){
                    container_item = 'book_for_reading';
                }
                d_item = $('.'+container_item).find('.d-item_' + id_title);
                delete_title(d_item);
            });
            closet(btn_acept);
        }

        if(($(this).find('.type_message').val())=='delete_title_list'){
            var id_title = $(this).parent().parent().find('.id_title').val();
            btn_acept.click(function(){
                item = $('.d-item_' + id_title).fadeOut(250,function(){
                    $(this).remove();
                });
            });
            closet(btn_acept);
        }

        if(($(this).find('.type_message').val())=='delete_list'){
            var id_list = $(this).parent().parent().find('.id_list').val();
            btn_acept.click(function(){
                d_list = $('.overview').find('.d-list_' + id_list);
                delete_list(d_list);
            });
            closet(btn_acept);
        }

        $('.dialog-confirm').fadeIn(250);
        $('.container_message').fadeIn(250);
        closet(div_closet);
        closet(btn_cancel);
        //closet($('.dialog-confirm').parent().parent());
        aling_message();

    });
}

function closet($ele){

  $ele.click(function(e) {
        $('.dialog-confirm').fadeOut(250);
        $('.container_message').fadeOut(250);
    });

}

var url_regex = new RegExp("(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})");
var alpha_numeric_regex = new RegExp("[a-zA-Z0-9\-áéíóú]+");
var numeric_regex = new RegExp("[\d]+");
var alpha_regex = new RegExp("[0-9]+");
var time_regex = new RegExp("([0-9]{2}[:]){2}[0-9]{2}");
var social_regex = new RegExp("[^\W]+");
function validate_regex(input, type){
    var ret = new Array();
    ret.push(false);
    ret.push('');
    if (type == 'numeric'){
        ret[0] = numeric_regex.test(input);
        ret[1] = 'Debe ser un valor numerico';
    }else if(type == 'alpha'){
        ret[0] = alpha_regex.test(input);
        ret[1] = 'Debe ser un valor de caracteres';
    }else if (type == 'alpha_numeric'){
        ret[0] = alpha_numeric_regex.test(input);
        ret[1] = 'Debe ser un valor alpha numerico';
    }else if(type == 'hh:mm:ss'){

    }else if(type == 'url'){
        ret[0] = url_regex.test(input);
        ret[1] = 'Debe ser una url valida';
    }else if(type == 'social'){
        ret[0] = social_regex.test(input);
        ret[1] = 'Solo el usario, no incluya "@ o /"';
    }
    return ret;
}

function selec_item(){
    $('.selec_item').click(function(){
        if(parseInt($(this).find('input').val())==0){
            $(this).addClass('active_item');
            $(this).find('input').val(1);
        }else{
            $(this).removeClass('active_item');
            $(this).find('input').val(0);
        }
    });

}

function aling_message(){
    $('.dialog-confirm').css({'left':'50%'});
    var witdh = parseInt($('.dialog_text').css('width'));
    var left = parseInt($('.dialog-confirm').css('left'));
    $('.dialog-confirm').css({'left':(left-(parseInt(witdh/2)))});
}
