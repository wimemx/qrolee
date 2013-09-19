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
                if($(this).find('input').hasClass('required')){
                    if($.trim($(this).find('input').val()) == ''){
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
                    }
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
        $('.dialog-confirm').empty();

        div_closet = $('<span class="dialog_closet"></span>');
        div_text = $('<div class="dialog_text grid-8 no-margin"></div>');
        div_text.append(div_closet);
        $('.dialog-confirm').append(div_text);
        span_text = $('<span></span>');
        text = 'Añadir un nuevo libro';
        text2 = 'Selecciona un libro para añadirlo a favoritos,' +
        ' libros leídos y libros por leer';
        p_text = $('<p class="p_text_dialog">' + text + '</p>');
        p_text2 = $('<p class="p_text_mini p_mini_book">' + text2 + '</p>');
        span_text.append(p_text);
        span_text.append(p_text2);
        div_text.append(span_text);

        input = $('<input class="input_add_book" type="text"/>');
        span = $('<span class="dark_yello_btn btn_search_book">Buscar</span>');
        div_text.append(input);
        div_text.append(span);

        container = $('<div class="container_title grid-6"></div>');
        container.append('sss');
        div_text.append(container);


        div_item = $('<div class="d-item_book grid-5 no-margin"></div>');
        container.append(div_item);
        span_wrapper =  $('<span class="wrapper_list" ></span>');
        div_item.append(s);
        img_wrapper = $('<img src="/static/img/portada"/></span>');
        div_container_text = $('<div class="d-container_text_book grid-3 no-margin"></div>');
        a = $('<a href="/qro_lee/entity/group/wime8_3/"'+
            'class="title title_book alpha grid-4 "></a>');
        p_text = $('<a href="#" class="place_pink" ></a>');


        closet(div_closet);

        $('.dialog-confirm').fadeIn(250);
        $('.container_message').fadeIn(250);

    });

    $('.message_alert').click(function(e) {
        $('.dialog-confirm').empty();
        span_text = $('<span></span>');
        var href = '';
        var type_list = '';

        if($('.type').val()=="group"){

            text = 'Para poder ser miembro tu solicitud sera enviada';
            p_text = $('<p class="p_text_dialog">' + text + '</p>');
            span_text.append(p_text);
            href = 'href="/registry/join_entity/'+$('.d-entity_id').val()+'"';
        }

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
            if(type=="delete_title"){

                name_title = $(this).parent().parent().find('.name_title').val();
                type_list = $(this).parent().parent().find('.type_list').val();
                list = '';
                if(type_list=='f'){
                    list = 'favoritos';
                }
                if(type_list=='r'){
                    list = 'leídos';
                }
                if(type_list=='p'){
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
                container_item = '';
                 if(type_list=='f'){
                    container_item = 'book_favorite';
                }
                if(type_list=='r'){
                    container_item = 'book_read';
                }
                if(type_list=='p'){
                    container_item = 'book_for_reading';
                }
                d_item = $('.'+container_item).find('.d-item_' + id_title);
                delete_title(d_item);
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

    });

});

function closet($ele){

  $ele.click(function(e) {
        $('.dialog-confirm').fadeOut(250);
        $('.container_message').fadeOut(250);
    });

}

