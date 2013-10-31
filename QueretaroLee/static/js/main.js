var content_search_entity = false;
var header_search_entity = false;
var entity_search_events = false;
var entity_search_atc = false;
var clickable = true;
var set_act = false;
var men_1 = false;
var combo_act = false;
var date = new Date();
var curr_month = date.getMonth();
var months = ['Enero','Febrero','Marzo','Abril',
    'Mayo','Junio','Julio','Agosto','Septiembre','Octubre',
    'Noviembre','Diciembre'];
var days = ['lunes','martes','miercoles',
    'jueves','viernes','sabado','domingo'];
var site_url = window.location.origin;
var styles =[
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#fd947a" }
    ]
  },{
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f1b191" }
    ]
  },{
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  }
];

function text_no_found(message){
    $('.d-not_found').fadeOut(250,function(){
        $(this).remove();
    });

    var error_msg = $('<p class="center grid-3 d-not_found" >No se pudieron encontrar '+message+'</div> ');
    $('.error').append(error_msg);
}

function init(lat,long) {

	var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});
		var latlng = new google.maps.LatLng( lat, long);
		var settings = {
			zoom: 13,
			center: latlng,
			mapTypeControl: true,
			mapTypeControlOptions: {
			  mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
			},
			navigationControl: true,
			navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
			mapTypeId: google.maps.MapTypeId.ROADMAP

    };

	var map = new google.maps.Map(document.getElementById("map"), settings);
	geocoder = new google.maps.Geocoder();
    marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: new google.maps.MarkerImage(
            "/static/img/gmap_marker.png", // reference from your base
            new google.maps.Size(36, 36), // size of image to capture
            new google.maps.Point(0, 0), // start reference point on image (upper left)
            new google.maps.Point(10, 10), // point on image to center on latlng (scaled)
            new google.maps.Size(20, 20) // actual size on map
        )
    });
	map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
 }

var geocoder;
var map;
var marker;
	function initialize(lat,long) {

        if(!lat | !long){
            lat = 20.589081;
            long = -100.38826;
        }

        var latlng = new google.maps.LatLng(lat, long);
			var settings = {
				zoom: 13,
				center: latlng,
				mapTypeControl: true,
				mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
				navigationControl: true,
				navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
				mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map"), settings);
		geocoder = new google.maps.Geocoder();
		marker = new google.maps.Marker({
			position: latlng,
			map: map,
			icon: new google.maps.MarkerImage(
				"/static/img/gmap_marker.png", // reference from your base
				new google.maps.Size(36, 36), // size of image to capture
				new google.maps.Point(0, 0), // start reference point on image (upper left)
				new google.maps.Point(10, 10), // point on image to center on latlng (scaled)
				new google.maps.Size(20, 20) // actual size on map
			),
			draggable: true
		});
		google.maps.event.addListener(marker, 'dragend', update_dir_info);
	};


function clear_input(no_clear){
    $('input').each(function(){
        if($(this).attr('name')){
            if(no_clear.indexOf($(this).attr('name')) < 0){
                $(this).val('');
            }
        }

    });
}

function item_select(all, value){
    var value_sel = $('.sel_spots .value_sel').empty();
    value_sel.fadeOut(0);
    var count = 1;
    $.each($('.sel_spots .name_spot option'),function(){
        if(count <= 10){
            var cad = $(this).val();
            var latln = $(this).attr('class');
            latln = $('.sel_spots .latln_spot .' + latln).val();
            if(all){
                value_sel.append('<span class="grid-3 sel_">'+
                    '<span>'+cad+'</span><input type="hidden" value="'+latln+'" '+
                    '/></span>');
            }else{
                if(cad.search(value) == 0){
                    value_sel.append('<span class="grid-3 sel_">'+
                        '<span>'+cad+'</span><input type="hidden" value="'+latln+'" '+
                        '/></span>');
                }
            }
        }
        count++;
    });
    value_sel.fadeIn(0);
    $('.sel_').click(function(){
        var name = $(this).find('span').text();
        var latlong_s = $(this).find('input').val();
        $('.sel_spots input').val(name);
        latlong_s = latlong_s.split(',');
        initialize(latlong_s[0],latlong_s[1]);
        $('.place_spot').val(1);
        $(this).parent().fadeOut(0);
    });
}

$(document).ready(function(){

    $('.sel_spots .dropdown').click(function(){
        item_select(true, '');
        combo_act = true;
    });
    $('.sel_spots input').keyup(function(){
        var value = $(this).val();
        $('.place_spot').val(0);
        item_select(false, value);

    });

    $('.book_crossing .show_t').click(function(){
        var count = $(this).parent().find('.container_crossing').find('.grid-7').length;
        var item_height = count * 107;
        $(this).find('span').empty();

        if(parseInt($(this).find('input').val())==0){
            $(this).find('input').val(1);
            $(this).find('span').append('Ver todos');
            item_height = 328;
        }else{
            $(this).find('input').val(0);
            $(this).find('span').append('Ver menos');
            if(count <= 3)
                item_height = 328;
            else
                item_height = count * 107;
        }
        $(this).parent().find('.container_crossing').animate({
            'height': item_height
        },250, function() {
            // Animation complete.
    });

    });

    $('.span_all').click(function(){
        show_index_items($(this));
    });
    $('.all_list').click(function(){
        show_items_left($(this));
    });

    $('.tag_btn').click(function(){

        var class_name = 't_1';
        if($(this).hasClass('t_2'))
            class_name = 't_2';

        if($(this).hasClass('t_3'))
            class_name = 't_3';

        $('.text_no_book').remove();
        $('.value_field').val('');

        $.each($('.book_crossing .tag'),function(){
            if($(this).hasClass(class_name)){
                $(this).fadeIn(300);
            }else{
                $(this).fadeOut(300);
            }
        });
    });

    $('.d-add_book').click(function(){

        var query = ' ';
        var type = 0;

        if($(this).find('input').val() == 'title')
            type = 1;
        if($(this).find('.list_typ').val() == 'list')
            type = 4;

        crsf = $('.csrf_header').find('input').val();

        if($(this).find('.add_type').val() == 'add')
            type_add_list(crsf, type, query);
        if($(this).find('.add_type').val() == 'edit')
            type_add_list(crsf, type, query);

    });
    $('.heading .search .search_btn').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            content_search_entity = true;
    });
    $('.header .search .icon').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            header_search_entity = true;
    });
    if($.trim($('.sidebar-b input.entity').val()) != '')
        entity_search_events = true;



    $( ".change" ).change(function() {
        $(this).parent().find('.text').html($(this).val());
    });
    $( "input.picture" ).change(function() {
        $(this).parent().find('.filename').html($(this).val());
    });
    $('form .select').each(function(){
        var val = $(this).find('select option:eq(0)').val();
        $(this).find('select').val(val).trigger('change');
    });
    $('span.settings').click(function(){
         if($('.brown_btn .sub-menu').is(':visible'))
            $('.brown_btn .sub-menu').fadeOut();
        if($(this).find('.sub-menu').is(':visible'))
            $(this).find('.sub-menu').fadeOut(300);
        else
            $(this).find('.sub-menu').fadeIn(300);
    });


    $('p.fb').click(function(){
            var search = '/me/groups?fields=cover,link,description,name,privacy,id';
            if($(this).hasClass('organization'))
                search = '/me/accounts?fields=description,name,location,perms,category,username,website,picture,cover';
            else if($(this).hasClass('events'))
                search = '/me/events?fields=cover,description,end_time,name,start_time,rsvp_status,location'
            if($(this).hasClass("update"))
                fb_obj_search(search, -1);
            else
                fb_obj_search(search);
        });

    $('.radio_btn').click(function(){
        $('.d-add_text_book').empty();
        $('.title_list').empty();
        $('.add_my_list').find('.d-item_book').fadeOut(250,function(){
            $('.add_my_list').find('.d-item_book').remove();
        });
        if($(this).parent().find('.radio_value').val()=='title'){
            $('.rad_ti').attr('src','/static/img/radioOn.png');
            $('.rad_aut').attr('src','/static/img/radioOff.png');
            $('.active_title').val(1);
            $('.active_author').val(0);
            $('.type_list').val('T');
            $('.title_list').append('Libros de tu lista');
            $('.d-add_text_book').append('+ Añadir un nuevo libro');
        }else{
            $('.rad_ti').attr('src','/static/img/radioOff.png');
            $('.rad_aut').attr('src','/static/img/radioOn.png');
            $('.active_title').val(0);
            $('.active_author').val(1);
            $('.type_list').val('A');
            $('.title_list').append('Autores de tu lista');
            $('.d-add_text_book').append('+ Añadir un nuevo autor');
        }
    });
    $('.multi_select span').click(function(){
        if($(this).closest('p').find('.invalid').length > 0)
            $(this).closest('p').find('.invalid').remove();
        if($(this).hasClass('active'))
            $(this).removeClass('active');
        else
            $(this).addClass('active');
    });
    $('.menu a').click(function(){

    });
    show_dialog();
     $('form').attr('autocomplete', 'off');
    if($('.d-paddin_top').length>0)
        $('.d-paddin_top').tinyscrollbar();
    if($('#scrollbar1').length>0)
        $('#scrollbar1').tinyscrollbar();

    $('.show_upload').click(function(){
       show_upload($(this));
    });



});

function fb_obj_search(search, type){
    $('.lightbox-wrapper .fb-objs span').each(function(){
        $(this).remove();
    });
    $('.lightbox-wrapper').fadeIn(300);
    FB.api(search, function(response) {
        if(response.error){
            $('.fb-objs .scrollbar').fadeOut(300, function(){
                $('.fb-objs .overview').append(
                    '<p style="font-size:13px;" class="center">No se pudo encontrar lo que búscaba, ' +
                        'verifique que este en la cuenta adecuada de ' +
                        '<a style="color:#3b579d;font-weight:bold;" target="_blank" href="https://facebook.com/me">Facebook</a> o ' +
                        'que su cuenta cuente con alguna pagía o grupo.</p>');
            });
            return;
        }
        var len = response.data.length;
        $.each(response.data,function(index){
            var obj = response.data[index];
            var id = obj.id;
            var span = $('<span class="fleft grid-5"></span>');
            var span_wrapper = $('<span class="fleft wrapper"><img src="" ></span>');
            var title = $('<h3 class="title grid-3 fright"></h3>');
            var privacy = $('<p style="margin-bottom:0px;" class="grid-3 fright"></p>');
            var link = $('<p class="grid-3 fright"></p>');
            var span_accept = $('<span class="green_btn fright">Acceptar</span>');

                if(obj.cover)
                    span_wrapper.find('img').attr('src',obj.cover.source);
                else if(obj.picture)
                    span_wrapper.find('img').attr('src',obj.picture.data.url);
                if(obj.link)
                    link.html(obj.link);
                var web = ' ';
                if(obj.link){
                    link.html(obj.link);
                    web = obj.link+' ';
                }
                if(obj.website){
                    link.html(obj.website);
                    web = obj.website+' ';
                }
                var start_time, end_time;
                if(obj.start_time && obj.end_time ){
                    if(obj.start_time != ''){
                        start_time = obj.start_time.split('T');
                        privacy.html('Comienza: '+start_time[0]);
                    }
                    if(obj.end_time != ''){
                        end_time = obj.end_time.split('T');
                        link.html('Termina: '+start_time[0]);
                    }
                }
                web = web.split(' ');
                title.html(obj.name);
                span.append(span_wrapper);
                span.append(title);
                if(obj.start_time || obj.privacy)
                    span.append(privacy);
                span.append(link);
                span.append(span_accept);
                $('.fb-objs #scrollbar1 .overview').append(span);
                if((len-1) == index)
                    $('.fb-objs #scrollbar1').tinyscrollbar();


                span.find('.green_btn').click(function(){
                    if(type){
                        $('.lightbox-wrapper').fadeOut(300);
                        $('input.fb_i').val(obj.id);
                        $('p.fb').find('span').html('Has vinculado con: '+obj.name);
                        update_obj('fb_id',obj.id);
                        return;
                    }
                    clear_input(['submit','location_id','picture','cover_picture','csrfmiddlewaretoken','entity_type']);
                    $('input.fb_id').val(obj.id);
                    $('.lightbox-wrapper').fadeOut(300);
                    $('input[name=name]').val(obj.name);
                    $('textarea[name=description]').val(obj.description);
                    privacy = obj.privacy;
                    if(privacy == 'OPEN')
                        $('select.change:eq(1)').val($('select.change:eq(1) option:eq(0)').val()).trigger('change');
                    else
                        $('select.change:eq(1)').val($('select.change:eq(1) option:eq(1)').val()).trigger('change');
                    $('input[name=fb]').val(obj.id);
                    if(web[0])
                        $('input[name=website]').val(web[0]);
                    var folder = '';
                    if(obj.location){
                        var address;
                        if('rsvp_status' in obj){
                            folder = '/event/';
                            $('.address').val(obj.location);
                            $('input.fb-url').val(obj.id);
                        }
                        else
                            address = obj.location.street+' '+obj.location.city+' '+obj.location.country;
                        if(obj.location.latitude){
                            address = new Array();
                            address.push(obj.location.latitude);
                            address.push(obj.location.longitude);
                            update_dir_info(null, address,1);
                        }else{
                            if(!('rsvp_status' in obj))
                                update_dir_info(address, null, 1);

                        }

                    }

                    if(start_time){
                        $('.date-init').val(start_time[0]);
                        var time = start_time[1].split(':');
                        $('.hour-init').val(time[0]+':'+time[1]+':00');
                    }
                    if(end_time){
                        $('.date-end').val(end_time[0]);
                        var time = end_time[1].split(':');
                        $('.hour-end').val(time[0]+':'+time[1]+':00');
                    }
                    if(span_wrapper.find('img').attr('src') != ''){

                        $.ajax({
                            type: "POST",
                            url: '/registry/media/upload/',
                            data: {
                                'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
                                'fb_img': span_wrapper.find('img').attr('src'),
                                'folder': folder
                            },
                            dataType: 'json'
                        }).done(function(data){
                            $('input.profile-pic').val(data.file_name);
                        });
                        var img_container = $('<div class="fb-img-preview fright"><span class="wrap"><img src="#"><span class="close"></span></span></div>');
                        img_container.find('img').attr('src', span_wrapper.find('img').attr('src'));
                        $('#picture').after(img_container);
                        $('#picture').fadeOut(300,function(){
                            $('.fb-img-preview').fadeIn(300);
                        });
                        img_container.find('.close').click(function(){
                            $(img_container).remove();
                            $('#picture').fadeIn(300);
                        });

                    }

                });
            });
        });
        $('.lightbox .close').click(function(){
            $('.lightbox-wrapper').fadeOut(300);
            return false;
        });
}

function update_dir_info(loc_address, lat_long, type){

    if(type){
        var latlng = new google.maps.LatLng(lat_long[0],lat_long[1]);
        marker.position = latlng;
        marker.setPosition(latlng);
		$('.lat').val(marker.getPosition().lat());
        $('.long').val(marker.getPosition().lng());
        if(geocoder){
            geocoder.geocode({'location':marker.getPosition()},function(results,status){
                var address = results[0].address_components[1].long_name +' '+
                    results[0].address_components[0].long_name +' '+
                    results[0].address_components[2].long_name +'#'+
                    results[0].address_components[3].long_name;

                $('.address').val(address);
            });
        }
    }else{
        $('.lat').val(marker.getPosition().lat());
        $('.long').val(marker.getPosition().lng());
        if(geocoder){
            geocoder.geocode({'location':marker.getPosition()},function(results,status){
                var address = results[0].address_components[1].long_name +' '+
                    results[0].address_components[0].long_name +' '+
                    results[0].address_components[2].long_name +'#'+
                    results[0].address_components[3].long_name;
                $('.address').val(address);
                $('.address_user').val(address.replace('#',' '));

            });
        }
    }
};

function dmap(data,id){

    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    var lat = 20.589081;
    var lon = -100.38826;

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(lat,lon),
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    };
    var div_map = 'd-map';
    if(id==2)
        div_map = 'map';

    var map = new google.maps.Map(document.getElementById(div_map),
        mapOptions);

    if(id==1){
        var counter = 1;
        $.each(data,function(index,k){
            var spot = data[index];
            $.each(spot,function(index2){

                var companyPos = new google.maps.LatLng(spot[index2].lat,spot[index2].long);
                var companyMarker = new google.maps.Marker({
                    position: companyPos,
                    map: map,
                    labelClass: "labels", // the CSS class for the label
                    icon: new google.maps.MarkerImage(
                        "/static/img/markers/marker"+counter+".png", // reference from your base
                        new google.maps.Size(20, 34), // size of image to capture
                        new google.maps.Point(0, 0), // start reference point on image (upper left)
                        new google.maps.Point(0, 0) // point on image to center on latlng (scaled)

                    ),
                    title:spot[index2].name

                });
                counter++;
            });

        });
    }
    if(id==2){
        var counter = 1;
        $.each(data,function(ind){
            var companyPos = new google.maps.LatLng(data[ind].lat,data[ind].long);
            var companyMarker = new google.maps.Marker({
                position: companyPos,
                map: map,
                labelClass: "labels", // the CSS class for the label
                icon: new google.maps.MarkerImage(
                    "/static/img/pin.png", // reference from your base
                    new google.maps.Size(34, 40), // size of image to capture
                    new google.maps.Point(0, 0), // start reference point on image (upper left)
                    new google.maps.Point(0, 0) // point on image to center on latlng (scaled)

                ),
                title:data[ind]['book'][0]
            });
            counter++;
        });
    }
}

function search_map_address(address){

    var lat = 20.589081;
    var long = -100.38826;

    if(address.length != 0){
        var addres_ = address.replace(/\s/g,"+");

        $.ajax({
            'async': false,
            'global': false,
            'url': 'http://maps.googleapis.com/maps/api/geocode/json?address='+addres_+
                '&sensor=false',
            'dataType': "json",
            'success': function (data) {
                lat = data['results'][0]['geometry']['location']['lat'];
                long = data['results'][0]['geometry']['location']['lng'];
            }
        });
    }

    initialize(lat, long);

}

function map_cheking(country, state, city){

    var lat = 20.589081;
    var lon = -100.38826;

    $.ajax({
        'async': false,
        'global': false,
        'url': 'http://maps.googleapis.com/maps/api/geocode/json?address='+state+'+'+city+
            '&components=country:'+country+'&sensor=false',
        'dataType': "json",
        'success': function (data) {
            lat = data['results'][0]['geometry']['location']['lat'];
            lon = data['results'][0]['geometry']['location']['lng'];
        }
    });


    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(lat,lon),
        mapTypeControl: true,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        },
        navigationControl: true,
        navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var div_map = 'reg_map';

    var map = new google.maps.Map(document.getElementById(div_map),
        mapOptions);

    var latlng = new google.maps.LatLng( lat, lon)
    $('.lat_long').val(lat+','+lon);
    geocoder = new google.maps.Geocoder();
		marker = new google.maps.Marker({
			position: latlng,
			map: map,
            icon: new google.maps.MarkerImage(
                "/static/img/pin.png", // reference from your base
                new google.maps.Size(34, 40), // size of image to capture
                new google.maps.Point(0, 0), // start reference point on image (upper left)
				new google.maps.Point(10, 10) // point on image to center on latlng (scaled)

			),
			draggable: true
		});
        google.maps.event.addListener(marker, 'dragend', update_latlog);
}

function update_latlog(lat_long){
    $('.lat_long').val(lat_long['latLng']['lb']+','+lat_long['latLng']['mb']);
}

function map_select(){
    var country = '';
    var state = '';
    var city = '';;
    var index = 0;
    $.each($('.selec_reg .sel_val'), function(){
        if(index == 0)
            country =$(this).find('option:selected').val();
        if(index == 1)
            state =$(this).find('option:selected').val();
        if(index == 2)
            city =$(this).find('option:selected').val();
        index++;
    });

    map_cheking(country, state, city);
}

function show_text($elem, message){
    $elem.fadeOut(300,function(){
        $(this).html(message);
        $(this).fadeIn(300);
    });
}

$(document).ready(function(){

    $('.address').keyup(function(){
        search_map_address($(this).val());
     });

    $('.book_register .btn_ra').click(function(){
        if($(this).hasClass('find')){
            show_text($('.text_1'), '¿ Dónde encontraste este libro ?');
            show_text($('.text_2'), 'Más información de donde encontraste el libro');
            $(this).find('img').attr('src','/static/img/radioOn.png');
            $(this).parent().find('.lib').find('img').attr('src','/static/img/radioOff.png');
            $(this).parent().find('input').val(1);
        }else{
            show_text($('.text_1'), '¿Dónde vas a liberar este libro?');
            show_text($('.text_2'), 'Más información sobre dónde liberarás el libro');
            $(this).find('img').attr('src','/static/img/radioOn.png');
            $(this).parent().find('.find').find('img').attr('src','/static/img/radioOff.png');
            $(this).parent().find('input').val(0);
        }
    });

    $('.heading .search .search_btn').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            content_search_entity = true;
    });
    $('.header .search .icon').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            header_search_entity = true;
    });

    if($.trim($('.sidebar-b input.entity').val()) != '')
        entity_search_events = true;

    var init_map = false;
    $('.entity .nav .btn').click(function(){
        $(this).parent().find('.btn').each(function(){
           $(this).removeClass('active');
        });
        $(this).addClass('active');

        var index = $(this).index();
        var len = $('.load').length;
        $('.load').each(function(i){
            if((len-1) == i){
                $(this).fadeOut(300,function(){
                    $('.load:eq('+index+')').fadeIn(300,function(){

                        if($(this).find('#map').length > 0){
                            if($('.lat').val() != ''){
                                if(!init_map)
                                    init(parseFloat($('.lat').val()),parseFloat($('.long').val()));
                                init_map = true;
                            }else{
                                init(-100.4057373,20.6144226);
                            }
                        }
                        if($(this).find("*[class*='user']").length >0)
                            $(this).find("*[class*='user']").each(function(){
                                $(this).fadeIn(300);
                            });
                    $('.load:eq('+index+') #scrollbar1').tinyscrollbar();
                    });

                });
            }else{
                $(this).fadeOut(300);
            }
        });

    });
    $( ".change" ).change(function() {
        $(this).parent().find('.text').html($(this).val());
    });
    $( "input.picture" ).change(function() {
        $(this).parent().find('.filename').html($(this).val());
    });
    $('form .select').each(function(){
        var val = $(this).find('select option:eq(0)').val();
        $(this).find('select').val(val).trigger('change');
    });
    $('span.brown_btn').click(function(){
        if($('.settings .member .sub-menu').is(':visible'))
            $('.settings .member .sub-menu').fadeOut();
        if($(this).find('.sub-menu-').is(':visible'))
            $(this).find('.sub-menu').fadeOut(300);
        else{
            $(this).find('.sub-menu').fadeIn(300);
            men_1 = true;
        }
    });
    $('.settings').click(function(){
        set_act = true;
        if($(this).find('.sub-menu-h').is(':visible'))
            $(this).find('.sub-menu-h').fadeOut(300);
        else
            $(this).find('.sub-menu-h').fadeIn(300);
    });



    $('.checkbox span').click(function(){
        if($.trim($(this).html()) != '')
            $(this).html('');
        else
            $(this).html('×');
    });
    $('.advanced_search_btn').click(function(){

        if($('.advanced_search').is(':visible'))
            $('.advanced_search').fadeOut(300);
        else{
            $('.advanced_search').fadeIn(300,function(){
                if($(this).hasClass('map')){
                    var map = $('<div id="map" class="clear"></div>');
                    map.insertAfter($('.advanced_search.map'));
                    map.fadeIn(300,initialize(20.600811424184588,-100.38887798413089));
                }
            });
        }
    });

    var view_more = true;
    $('.news-feed .more').click(function(){
        var $this = $(this);
        var elements = $(this).parent().find('.viewport .overview .item').length - 2;
        var height = $(this).parent().outerHeight(true);
        if(view_more){
            $(this).parent().animate({
                'height': height+(elements * 45)
            }, function(){
                var h = $(this).find('.viewport').outerHeight(true);
                $(this).find('.viewport').animate({
                    'height': h+(elements*45)
                }, function(){
                    $this.html('ver menos');
                    view_more = false;
                });
            });
        }else{
            var h = $(this).parent().find('.viewport').outerHeight(true);
            $(this).parent().find('.viewport').animate({
                'height': h-(elements*45)
            }, function(){
                $(this).parent().animate({
                    'height': height-(elements * 45)
                },function(){
                    $this.html('ver más');
                    view_more = true;
                })
            });

        }
    });

    $('.filter .checkbox').click(function(){
        $('#map').remove();
        $('.filter .checkbox').each(function(){
            $(this).removeClass('active');
        });
        $(this).addClass('active');

        var type = $(this).parent().find('.active').attr('class').split(' ');
        var category_type = -1;
        var join = 'none';
        var and = 0;
        var query, fields, search, result;
        var create_user = false;

        category_type = parseInt(type[3]);
        type = type[2];
        $('.advanced_search').remove();
        if(category_type == 1)
            create_user = true;

        if(type == 'registry.category'){
            override = true;
            query = {
                'name__icontains':'',
                'type': category_type
            }
            and = 1;
            fields = ['name', 'id'];
        }else if(type == 'account.genre'){
            override = true;

            query = {
                'name__icontains':''
            }
            fields = ['name', 'id'];
        }

        search = {
            'type': type,
            'fields': JSON.stringify(fields),
            'value': JSON.stringify(query),
            'and': and,
            'join': join
        }
        search = JSON.stringify(search);
        $('.results .item').each(function(){
            $(this).remove();
        });
        if (type != 'privacy' && type != 'event')
            result = advanced_search(search, $('.advanced_filter').find('div input[type=hidden]').val());

        if(type == 'registry.category'
            || type == 'account.genre'){
                if(create_user)
                    create_template('user', result, category_type);
                else
                    create_template('category', result, category_type);

        }else if(type == 'event'){
            create_template('event');
        }else if(type == 'privacy')
            create_template('privacy');

    });

    $('.advanced_filter .search_btn').click(function(){
        var create_user = false;
        var search = new Array();
        var query;
        var fields;
        var and = 0;
        var override = false;
        var join = 'none';
        var _in = new Array();
        var type = $('.filter').find('.active').attr('class').split(' ');
        var category_type = '';
        var result;

        category_type = parseInt(type[3]);
        type = type[1];


        if(type == 'auth.user'){
            var search_lists = new Array();
            var filters = new Array();
            if(category_type != ''){
                $('.advanced_search .checkbox').each(function(){
                    if($(this).find('span').html() != ''){
                        var _class = $(this).attr('class').split(' ');
                        if(isNaN(_class[1]))
                            search_lists.push(_class[1]);
                        else
                            search_lists.push(parseInt(_class[1]));
                    }
                });
                $('.advanced_search .search_filters').each(function(){
                    var filter = new Array();
                    if($(this).find('.change').val() == 'author_name'){
                        filter.push('first_name__icontains');
                        filter.push($(this).find('input').val());
                    }else if($(this).find('.change').val() == 'book_title'){
                        filter.push('title__icontains');
                        filter.push($(this).find('input').val());
                    }
                    filters.push(filter);
                });
                var activity = new Array();
                $('.select_wrapper').each(function(){
                    activity.push($(this).find('input').val().toLowerCase());
                });

                query = {
                    'username__icontains': $.trim($('.advanced_filter .search').val()),
                    'first_name__icontains': $.trim($('.advanced_filter .search').val())
                }
                fields = ['first_name',
                    'last_name','username','id'];
                join = {
                    'tables':{
                        0: JSON.stringify(['registry.profile','auth.user']),
                        1: JSON.stringify(['account.activity'])
                    },
                    'quieres':{
                        0: JSON.stringify(['id']),
                        1: JSON.stringify(['user_id'])
                    },
                    'fields':{
                        0: JSON.stringify(['picture']),
                        1: JSON.stringify(['title', 'id'])
                    },
                    'type':{
                        0: JSON.stringify(search_lists)
                    },
                    'filters':{
                        0: JSON.stringify(filters)
                    },
                    'activity':{
                        0: JSON.stringify(activity)
                    }
                }

                join = JSON.stringify(join);
                create_user = true;

            }else{


            }
        }else if(type == 'account.author'){
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val())
            }
            fields = ['name','id','picture'];
            join = {
                'tables':{
                    0: JSON.stringify(['account.title','account.authortitle']),
                    1: JSON.stringify(['account.rate'])

                },
                'quieres':{
                    0: JSON.stringify(['author_id']),
                    1: JSON.stringify(['element_id'])
                },
                'fields':{
                    0: JSON.stringify(['title']),
                    1: JSON.stringify(['grade'])
                },
                'activity':{
                    0:JSON.stringify(['A'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'account.page'){
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val())
            }
            fields = ['name','coment','user_id','id'];
            join = {
                'tables':{
                    0: JSON.stringify(['account.page','auth.user'])

                },
                'quieres':{
                    0: JSON.stringify(['id'])
                },
                'fields':{
                    0: JSON.stringify(['name'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'account.list'){
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val())
            }
            fields = ['name','picture'];
            join = {
                'tables':{
                    0: JSON.stringify(['auth.user','account.list'])
                },
                'quieres':{
                    0: JSON.stringify(['id'])
                },
                'fields':{
                    0: JSON.stringify(['username','first_name','last_name'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'registry.event'){
            var start_time = '';
            var end_time = '';
            if($('.date-init').val() != '')
                start_time = $('.date-init').val();
            if($('.date-end').val() != '')
                end_time = $('.date-end').val();

            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'start_time__gt':start_time,
                'end_time__lt':end_time
            }
            and = 1;
            fields = ['name','start_time','end_time','owner_id','picture','id'];
        }else if(type == 'registry.entity.1' || type == 'registry.entity.3'){

            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(_class[1]);
                }
            });

            if(_in.length == 0)
                _in.push(-1);
            var s = {
                'type': 'registry.entitycategory',
                'fields': JSON.stringify(
                    ['entity_id']),
                'value': JSON.stringify({
                    'category_id__in': JSON.stringify(_in)
                }),
                'and': and,
                'join': join
            }
            s = JSON.stringify(s);
            var _ids = advanced_search(s, $('.advanced_filter').find('div input[type=hidden]').val());
            var ids = new Array();
            var distance = '';
            $.each(_ids,function(i){
                ids.push(parseInt(_ids[i].entity_id));
            });
            if($.trim($('.distance').val()) != '')
                distance = $.trim($('.distance').val())+'&'+$('.lat').val()+'&'+$('.long').val();

            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': category_type,
                'pk__in': JSON.stringify(ids),
                'distance': distance
            }
            fields = ['name', 'picture', 'user_id','id'];
            and = 1;
            join = {
                'tables':{
                    0: JSON.stringify(['registry.category', 'registry.entitycategory'])
                },
                'quieres':{
                    0: JSON.stringify(['entity_id'])
                },
                'fields':{
                    0: JSON.stringify(['name'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'account.list'){
            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(_class[1]);
                }
            });
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': 2,
                'category_id__in': JSON.stringify(_in)
            }
            fields = ['name', 'picture', 'user_id','id'];
        }else if(type == 'registry.entity.2'){
            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(parseInt(_class[1]));
                }
            });
            if(_in.length == 0)
                _in.push(-1);
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': 1,
                'privacy__in': JSON.stringify(_in)
            }
            fields = ['name', 'picture', 'user_id', 'privacy','id'];
            and = 1;
        }else if(type == 'account.title'){

            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(parseInt(_class[1]));
                }
            });
            var s = {
                'type': 'account.genretitle',
                'fields': JSON.stringify(
                    ['title_id']),
                'value': JSON.stringify({
                    'genre_id__in': JSON.stringify(_in)
                }),
                'and': and,
                'join': join
            }
            s = JSON.stringify(s);
            if(_in.length > 0){
                var _ids = advanced_search(s, $('.advanced_filter').find('div input[type=hidden]').val());
                var ids = new Array();
                $.each(_ids,function(i){
                    ids.push(parseInt(_ids[i].title_id));
                });
            }
            query = {
                'title__icontains': $.trim($('.advanced_filter .search').val()),
                'pk__in': JSON.stringify(ids)
            }
            fields = ['title', 'cover','id'];
            and = 1;
            join = {
                'tables':{
                    0: JSON.stringify(['account.author','account.authortitle']),
                    1: JSON.stringify(['account.rate'])

                },
                'quieres':{
                    0: JSON.stringify(['title_id']),
                    1: JSON.stringify(['element_id'])
                },
                'fields':{
                    0: JSON.stringify(['name']),
                    1: JSON.stringify(['grade'])
                },
                'activity':{
                    0: JSON.stringify(['T'])
                }
            }
            join = JSON.stringify(join);
        }
        if($.trim($('.advanced_filter .search').val()) != ''
            || override){
            search = {
                'type': type,
                'fields': JSON.stringify(fields),
                'value': JSON.stringify(query),
                'and': and,
                'join': join
            }
            search = JSON.stringify(search);
            $('.results .item').each(function(){
                $(this).remove();
            });
            var csrf = $('.csrf_header').find('input').val();
            var api = false;
            if(type == 'account.title' || type == 'account.author'){
                result = advanced_search(search, csrf);
                query = {
                    'q': JSON.stringify($.trim($('.advanced_filter .search').val()).split(' ')),
                    'start_index': {
                        0: 0
                    },
                    'type': {
                        0: type
                    }
                }
                api = search_api(csrf, query);
            }else
                result = advanced_search(search, csrf);
                console.log(result);
            if(result.response != 0){
                $.each(result,function(i){
                    create_template(type, result, i, create_user);
                });
            }else{
               var p = $('<span class="item"><p class="center"> No se pudieron ' +
                    'encontrar resultados para su búesqeda</p></span>');
                $('.results').append(p);

            }

        }
    });

    if($('#scrollbar1').length>0)
        $('#scrollbar1').tinyscrollbar();


    //$('.nav .btn:eq(0)').trigger('click');
    $('.btn.no-ajax').click(function(){
        if(!$(this).hasClass('no-action')){
            $('.container_message').fadeIn(300);
        }
    });
    $('.close').click(function(){
        $(this).closest('.container_message').fadeOut(300, function(){
            $(this).find('input').val('');
            $(this).find('textarea').val('');
        });
    });
});

function create_template(type, result,i, create_user){
    var span;
    if(type == 'user'){
        span = $('<span class="advanced_search fleft">');
        var p = $('<p class="title">Usarios con gustos similares</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox A">Autores</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox G">Géneros</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox T">Títulos</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox 0">Títulos favoritos</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox 1">Títulos por leer</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox 2">Títulos leidos</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="title fleft">Añadir un filtro</p>');
        span.append(p);
        p = $('<p class="fleft advanced_search_btn">+ Añadir otro filtro</p>');
        span.append(p);
        p.click(function(){
            var filter = $('<div style="margin-top:10px;" class="search_filters fleft">');
            var _span =  $('<span class="select_wrapper date alpha fright">');
            var inner_span = $('<span style="width:130px;" class="grid-2 select no-margin">');
            _span.append(inner_span);
            var input = $('<input style="margin-left:20px;" type="text" class="date">');
            _span.append(input);
            var text = $('<span class="text"></span>');
            inner_span.append(text);
            var dropdown =  $('<span class="dropdown">');
            inner_span.append(dropdown);
            var select = $('<select class="change value"><select>');
            var option = $('<option value="author_name">Actualmente leyendo</option>');
            select.append(option);
            inner_span.append(select);
            filter.append(_span);
            span.append(filter);
            select.change(function() {
                $(this).parent().find('.text').html($(this).find(':selected').html());
            });
            select.val('author_name').change();
        });

    }else if(type == 'category'){
        span = $('<div class="advanced_search fleft"></div>');
        var p = $('<p class="title">Búsqueda por categoria</p>');
        span.append(p);
        $.each(result,function(indx){
            p = $('<p class="checkbox '+result[indx].id+'"></p>');
            p.html(result[indx].name);
            p.append($('<span></span>'));
            span.append(p);
        });
        if(i == 3){
            var filter = $('<div style="margin-top:20px;" class="search_filters fleft">');
            var _span =  $('<span class="select_wrapper date alpha fright">');
            var inner_span = $('<span class="grid-2 select date no-margin">');
            _span.append(inner_span);
            var text = $('<span class="text">Distancia (km)</span>');
            inner_span.append(text);
            var input = $('<input class="distance date" type="text">');
            _span.append(input);
            filter.append(_span);
            span.append(filter);
            span.addClass('map');
        }

    }else if(type=='privacy'){
        span = $('<span class="advanced_search fleft">');
        for(var i=0;i<2;i++){
            var p;
            if(i == 0){
                p = $('<p class="checkbox 0"></p>');
                p.html('Público');
            }else{
                p = $('<p class="checkbox 1"></p>');
                p.html('Privado');

            }
            p.append($('<span></span>'));
            span.append(p);
        }
    }else if(type == 'event'){

        var filter = $('<div class="search_filters fleft">');
        span =  $('<span class="select_wrapper date alpha fright">');
        var inner_span = $('<span class="grid-2 select date no-margin">');
        span.append(inner_span);
        var text = $('<span class="text">Desde</span>');
        inner_span.append(text);
        var input_init = $('<input class="date-init date" type="text">');
        var input_end = $('<input class="date-end date" type="text">');
        input_init.datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function(dateText) {
            },
            onClose: function( selectedDate ) {
                input_end.datepicker( "option", "minDate", selectedDate );
            }
        });
        span.append(input_init);
        filter.append(span);
        span =  $('<span class="select_wrapper date alpha fright">');
        inner_span = $('<span class="grid-2 select date no-margin">');
        span.append(inner_span);
        text = $('<span class="text">Hasta</span>');
        inner_span.append(text);

        span.append(input_end);
        filter.append(span);
        span = $('<span class="advanced_search fleft">');
        var p = $('<p class="title">Búsqueda por fecha</p>');
        span.append(p);
        span.append(filter);
        input_end.datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function(dateText) {
            }
        });

    }else{
        var item = $('<div class="item"></div>');
        var wrapper_fleft = $('<span class="wrapper fleft"></span>');
        var a_wrapper = $('<a></a>');
        var a_title = $('<a></a>');
        a_wrapper.append(wrapper_fleft);
        item.append(a_wrapper);
        var img = $('<img src="" attr="">');
        var url = '/static/img/create.png';
        if(result[i].extras[1])
            if(result[i].extras[1][0] != 'None')
                url = '/static/media/users/'+result[i].id+
                    '/profile/'+result[i].extras[1][0];
        wrapper_fleft.append(img);
        var h3 = $('<h3 class="title no-margin grid-4 fright"></h3>');
        if(type == 'account.author' || create_user){
            if(type == 'account.author'){
                a_wrapper.attr('href','/qro_lee/profile/author/'+result[i].id);
                a_title.attr('href','/qro_lee/profile/author/'+result[i].id);
                h3.html(result[i].name);
                url = result[i].picture;
            }else{
                a_wrapper.attr('href','/accounts/users/profile/'+result[i].id);
                a_title.attr('href','/accounts/users/profile/'+result[i].id);
                if (result[i].first_name != '')
                    h3.html(result[i].first_name);
                else
                    h3.html(result[i].username);
            }
        }else if(type == 'account.title'){
            h3.html(result[i].title);
            url = result[i].cover;
        }else{
            h3.html(result[i].name);
        }
        img.attr('src', url);

        var p = $('<p class="fright no-margin grid-4"></p>');
        a_title.append(h3);
        item.append(a_title);
        var entity_type = 'organization';

        if (type == 'registry.entity.2'){
            p.addClass('category');
            entity_type = 'group';
            a_wrapper.attr('href','/qro_lee/entity/'+entity_type+'/'+result[i].id);
            a_title.attr('href','/qro_lee/entity/'+entity_type+'/'+result[i].id);
            var privacy;
            if(result[i].privacy == 'False')
                privacy = 'Público';
            else
                privacy = 'Privado';
            p.html(privacy);
            item.append(p);
        }else if (type == 'account.page'){
            a_wrapper.attr('href','/qro_lee/user/'+result[i].user_id+'/page/'+result[i].id);
            a_title.attr('href','/qro_lee/user/'+result[i].user_id+'/page/'+result[i].id);
            var privacy;
            if(result[i].coment)
                privacy = result[i].coment.replace(/<\/?[^>]+>/gi, '');
            else
                privacy = '';
            p.html(truncText(privacy, 120));
            item.append(p);
            var img_exist = false;
            var img_coment = $('<div></div>');
            img_coment.append(result[i].coment);
            $.each(img_coment,function(){
                if($(this).find('img').length>0 & !img_exist){
                    img.attr('src',$(this).find('img').attr('src'));
                    img_exist = true;
                }
            });

        }else if(type == 'registry.entity.1' ||
            type == 'registry.entity.3'){

            if($.trim(result[i].picture) == '')
                result[i].picture = 'None';
            if(result[i].picture != 'None')
                url = '/static/media/users/'+result[i].user_id+
                    '/entity/'+result[i].picture;

            img.attr('src', url);
            a_wrapper.attr('href','/qro_lee/entity/'+entity_type+'/'+result[i].id);
            a_title.attr('href','/qro_lee/entity/'+entity_type+'/'+result[i].id);
            p = $('<p class="category fright no-margin grid-4"></p>');
            $.each(result[i].extras,function(indx){

                $.each(result[i].extras[indx], function(indice){
                    var category = result[i].extras[indx][indice];
                    p.append($('<span style="margin-right:5px;font-size:11px;">'+category+'</span> '));

                });

            });
            item.append(p);
        }else if(type == 'account.list'){
            var text= 'Lista creada por ';
            //var p = $('<p class="fright no-margin grid-4"></p>');
            console.log(result[i]);
            if(result[i].extras[0][1] != '')
                p.html(text+result[i].extras[0][1]+ ' '+ result[i].extras[0][2] );
            else
                p.html(text+result[i].extras[0][0]);

            item.append(p);
        }else if(type == 'account.author'){
            p.html(result[i].extras[0].length+' Libros');
            item.append(p);
        }else if(type == 'account.title'){
            if($.trim(result[i].cover) != '')
                img.attr('src',result[i].cover);
            else if(result[i].cover)
                img.attr('src',result[i].cover);
            else
                 img.attr('src','/static/img/create.png');
            a_wrapper.attr('href','/qro_lee/profile/title/'+result[i].id);
            a_title.attr('href','/qro_lee/profile/title/'+result[i].id);
            var text= '';
            p.html(text+result[i].extras[1][0]);
            item.append(p);
        }else if(type == 'registry.event'){
            a_wrapper.attr('href','/qro_lee/events/'+result[i].id);
            a_title.attr('href','/qro_lee/events/'+result[i].id);
            var date = result[i].start_time.split(' ');
            var hour = date[1].split(':');
            date = date[0];
            date = $.datepicker.parseDate("yy-mm-dd",  date);
            var date_string = days[date.getDay()-1]+', '+
                date.getDate()+' de '+months[date.getMonth()]+
                ' del '+date.getFullYear()+' '+hour[0]+':'+
                hour[1]+'hrs.';
            p.html(date_string);
            item.append(p);
            if(result[i].picture)
                url = '/static/media/users/'+result[i].owner_id+'/event/'+result[i].picture;
            else
                url = '/static/img/create.png';
            img.attr('src', url);
        }else if(create_user){
            var a;
            if(result[i].extras[0][0]){
                a = $('<a class="spot" href="/qro_lee/profile/title/'+result[i].extras[0][1]+'">'+result[i].extras[0][0]+'</a>')
                p.html('Esta leyendo ');
            }
            p.append(a);
            item.append(p);
        }
        var title = h3.html();
        title = title.substring(0, 16);
        h3.html(title+' ...');
        $('.results').append(item);
        return;
    }
    span.find('p').each(function(){
        $(this).find('span').click(function(){
            if($.trim($(this).html()) != '')
                $(this).html('');
            else
                $(this).html('×');
        });
    });
    $('.heading').after(span);
}
function get_genre($div_text){

        $.ajax({
            type: "POST",
            url: '/qro_lee/list_genre/',
            data: {
                'csrfmiddlewaretoken': $('.csrf_header').find('input').val()
            },
            dataType: 'json'
        }).done(function(data){

            $div_text.find('.container_genre').remove();
            var div_container_genre =  $('.container_genres');
            div_container_genre.fadeOut(250);
            div_container_genre.empty();
            div = $('<div class="container_genre"></div>');

            $.each(data,function(i){
                var active = '';
                if(data[i].active){
                    active = ' active_genre ';
                }else{

                    span_g = $('<span class="grid-4 no-margin genre"></span>');
                    img_g = $('<img src="/static/img/start.png"/>');
                    span_g.append(img_g);
                    span_g.append(data[i].name);
                    div_container_genre.append(span_g);
                    div_container_genre.fadeIn(250);

                }

                span = $('<span class="grid-3 no-margin genre' + active +
                ' genre_black"></span>');
                id_genre = $('<input type="hidden" value="'+data[i].id+'" >');
                img = $('<img src="/static/img/start_black.png"/>');
                span_text = $('<span class="genre_name" >'+data[i].name+'</span>');
                span.append(id_genre);
                span.append(img);
                span.append(span_text);
                span.click(function(){
                   add_genre($(this));
                });
                div.append(span);
            });
            $div_text.append(div);
       });
}

function add_genre($span){
    $.ajax({
    type: "POST",
    url: '/registry/add_genre/',
    data: {
    'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
    'id_genre':$span.find('input').val()
    },
    dataType: 'json'
    }).done(function(data){
        get_genre($span.parent().parent());
    });
}

/*
query = {
'q': JSON.stringify(['Harry','Potter']),
'start_index':{
0: 0
},
'particular_fields': {
0: 'inauthor',
1: 'intitle'
},
'particular_fields_terms':{
0: JSON.stringify(['jk', 'rollwing']),
1: JSON.stringify(['Azkaban'])
}
}
*/


function dialog_titles(csrf, data, id){
    $('.dialog-confirm').empty();
    div_closet = $('<span class="dialog_closet"></span>');
    closet(div_closet);
    div_text = $('<div class="dialog_text grid-8 no-margin"></div>');
    div_text.append(div_closet);
    $('.dialog-confirm').append(div_text);
    span_text = $('<span></span>');
    text = 'Añadir un nuevo libro';
    if(id == 1 | id == 3)
        text2 = 'Selecciona un libro para añadirlo a favoritos,' +
            ' libros leídos y libros por leer';
    if(id == 4){
        var text2 = 'Selecciona un libro para añadirlo a tu nueva lista';
        if($('.type_list').val()=='A'){
            text = 'Añadir un autor';
            text2 = 'Selecciona un author para añadirlo a tu nueva lista';
        }
    }

    p_text = $('<p class="p_text_dialog">' + text + '</p>');
    p_text2 = $('<p class="p_text_mini p_mini_book">' + text2 + '</p>');
    span_text.append(p_text);
    span_text.append(p_text2);
    div_text.append(span_text);

    input = $('<input class="input_add_book" value="" type="text"/>');
    span = $('<span class="dark_yello_btn btn_search_book"></span>');
    input.keyup(function(){
        if($(this).val().length%2){

            $('.dialog_text').find('#scrollbar1').fadeOut(100,function(){
                $(this).remove();
                var words = $('.input_add_book').val();
                if(words.length != 0 && words.search(/^\s*$/) != 0 && words.length %3 == 0){
                    type = 5;
                    if(id!=4)
                        type = 2;
                    type_add_list($('.csrf_header').find('input').val(), type, words);
                }
            });
        }

    });
    div_text.append(input);
    div_text.append(span);

    list_title(csrf, data, div_text, id);
}

function list_title(csrf, data, div_text, type){

    div_scroll = $('<div id="scrollbar1"></div>');
    show = '';
    if(type==1)
        show = 'style="display:none;"'
    div_scroll.append('<div class="scrollbar scrollbar_add"  '+ show +' ><div class="track">'+
        '<div class="thumb"><div class="end"></div></div></div></div>');

    min_height = '';

    var type_list = 'T';

    if($('.d_type_list').length > 0)
        type_list = $('.d_type_list').val();

    if($('.type_list').length > 0)
        type_list = $('.type_list').val();

    if(type==1)
        min_height = ' min_list ';

    div_view_port = $('<div class="viewport' + min_height + ' container_title"></div>');
    div_scroll.append(div_view_port);
    container = $('<div class="overview grid-8 no-margin"></div>');
     div_view_port.append(container);

    div_text.append(div_scroll);

        array = [];
        count_id = 0;
        bar = false;
    if(type_list=='T'){

    titles_l = data[0];
    delete titles_l['response'];
    var array_ids_google = [];
    if(type !=1){

        $.each(titles_l,function(i){
            array_ids_google.push(titles_l[i].id_google);
            item_title = $('<span class="item_ti item_title_' + count_id + '"></span>')
            type_add = 'grid-5 ';
            if(type==4)
                type_add = 'grid-4 selec_item d-item_mini_list ';

            div_item = $('<div class="d-item_book_mini ' + type_add + ' no-margin"></div>');
            item_title.append(div_item);
            item_title.append('<input type="hidden" class="title_inte" value="1"/>');
            item_title.append('<input type="hidden" class="id_tit" value="' +
                titles_l[i].id + '"/>');
            span_wrapper =  $('<span class="wrapper_list wrapper_title_mini border_author" ></span>');
            div_item.append(span_wrapper);
            url_mini = '' + titles_l[i].cover;
            url = '' + titles_l[i].cover;

            var obj = {
                'title':titles_l[i].title
            }

            array.push(obj);

            img_wrapper = $('<img class="img_size_all" src="'+url_mini+'"/></span>');
            span_wrapper.append(img_wrapper);

            type_add = 'grid-3';
            if(type==4)
                type_add = 'grid-2';

            div_container_text = $('<div class="d-container_text_book ' +
                type_add + ' no-margin"></div>');
            div_item.append(div_container_text);
            item_title.append(div_item);
            a = $('<a title="' + titles_l[i].title + '" class="title title_book_mini alpha ' +
                type_add + '"></a>');
            a.append(truncText(titles_l[i].title,15));
            div_container_text.append(a);
            p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                ' no-margin" ></p>');
            a_author = $('<a class="title_author" ></a>');
            var author_att = 'autor anonimo';
            if(titles_l[i]['extras'][1].length!=0)
                author_att = 'De ' + truncText(titles_l[i]['extras'][1][0],13);
            a_author.append(author_att);
            p_text_author.append(a_author);
            div_container_text.append(p_text_author);
            container_stars = $('<span class="grid-3 no-margin"></span>');
            var grade = 5;
            for(var index = 0;index<5;index++){
                if(index<grade){
                    container_stars.append('<img class="fleft" src="/static/img/comunityStar.png" />');
                }else{
                    container_stars.append('<img class="fleft" src="/static/img/backgroundStar.png" />');
                }
            }

            div_container_text.append(container_stars);
            div_add = $('<div class="container_add_my grid-3 no-margin"></div>');
            span_add_f = $('<span class="add_my_titles grid-3 no-margin"></span>');
            span_add_l = $('<span class="add_my_titles grid-3 no-margin"></span>');
            span_add_p = $('<span class="add_my_titles grid-3 no-margin"></span>');
            span_add_f.append('Añadir a mis favoritos');
            span_add_l.append('Añadir a mis libros leídos');
            span_add_p.append('Añadir a mis libros por leer');
            span_add_f.append('<input type="hidden" class="list_f" value="0" />');
            span_add_l.append('<input type="hidden" class="list_l" value="0" />');
            span_add_p.append('<input type="hidden" class="list_p" value="0" />');
            div_add.append(span_add_f);
            div_add.append(span_add_l);
            div_add.append(span_add_p);

            if(type == 1 | type == 3)
                item_title.append(div_add);
            if(type==4)
                div_item.append('<input type="hidden" class="my_list" value="0" />');

            container.append(item_title);

            if(i == (titles_l.length-1)){
                bar = true;
            }
            count_id++;

        });
    }
        if(data.length > 1 & data[1] != null){

            data = data[1];

            var titles = data['result_api']['items'];
            $.each(titles,function(i){
                var id_google_exist = false;
                $.each(array_ids_google,function(ind){
                    if(array_ids_google[ind]==titles[i].id){
                        id_google_exist = true;
                    }
                });

                if(!id_google_exist){
                    attribute = titles[i]['volumeInfo'];
                    attribute_access = titles[i]['accessInfo'];
                    item_title = $('<span class="item_ti item_title_' + count_id + '"></span>')

                    type_add = 'grid-5';
                    if(type==4)
                        type_add = 'grid-4 selec_item d-item_mini_list';

                    div_item = $('<div class="d-item_book_mini ' + type_add + ' no-margin"></div>');
                    item_title.append(div_item);
                    item_title.append('<input type="hidden" class="title_inte" value="0"/>');
                    span_wrapper =  $('<span class="wrapper_list wrapper_title_mini border_author" ></span>');
                    div_item.append(span_wrapper);
                    url = '/static/img/create.png';
                    url_mini = '/static/img/create.png';

                    if( "imageLinks" in attribute ){
                        url_mini = ''+attribute['imageLinks']['smallThumbnail'];
                        url = ''+attribute['imageLinks']['thumbnail'];
                    }

                    pages = 0;
                    if('pageCount' in attribute)
                        pages  = attribute['pageCount'];
                    desc = '';
                    if('description' in attribute)
                        desc  = ''+attribute['description'];

                    isbn = '';
                    isbn13 = '';
                    if('industryIdentifiers' in attribute){
                        if('identifier' in attribute['industryIdentifiers'][0])
                            isbn = attribute['industryIdentifiers'][0]['identifier'];
                        if(attribute['industryIdentifiers'].length >1){
                            if('identifier' in attribute['industryIdentifiers'][1])
                                isbn13 = attribute['industryIdentifiers'][1]['identifier'];
                        }
                    }

                    publisher = '';
                    if('publisher' in attribute)
                        publisher = attribute['publisher'];

                    publishedDate = '2013';
                    if('publishedDate' in attribute)
                        publisher = attribute['publishedDate'];

                    language = '';
                    if('language' in attribute)
                        language = attribute['language'];

                    country = '';
                    if('country' in attribute)
                        country = attribute_access['country'];

                    var name_author = 'autor anonimo';
                    if('authors' in attribute)
                        name_author = attribute['authors'];

                    var obj = {
                        'title':attribute['title'],
                        'author':name_author,
                        'cover':url,
                        'description':desc,
                        'publisher':publisher,
                        'publishedDate':publishedDate ,
                        'language':language,
                        'country':country,
                        'isbn':isbn,
                        'isbn13':isbn13,
                        'pages':pages,
                        'picture':url_mini,
                        'id_google':titles[i].id
                    }
                    array.push(obj);

                    img_wrapper = $('<img class="img_size_all" src="'+url_mini+'"/></span>');
                    span_wrapper.append(img_wrapper);

                    type_add = 'grid-3';
                    if(type==4)
                        type_add = 'grid-2';

                    div_container_text = $('<div class="d-container_text_book ' +
                        type_add + ' no-margin"></div>');
                    div_item.append(div_container_text);
                    item_title.append(div_item);
                    a = $('<a title="' + attribute['title'] + '" class="title title_book_mini alpha ' + type_add + '"></a>');
                    a.append(truncText(attribute['title'],13));
                    div_container_text.append(a);
                    p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                        ' no-margin" ></p>');
                    a_author = $('<a " class="title_author" ></a>');
                    var author_att = 'autor anonimo';
                    if('authors' in attribute)
                        if(attribute['authors'][0].length=!0)
                            author_att = truncText(attribute['authors'][0],13)
                    a_author.append(author_att);
                    p_text_author.append('De ');
                    p_text_author.append(a_author);
                    div_container_text.append(p_text_author);
                    container_stars = $('<span class="grid-3 no-margin"></span>');

                    for(var index = 0;index<5;index++){
                        container_stars.append('<img class="fleft" src="/static/img/backgroundStar.png" />');
                    }
                    div_container_text.append(container_stars);
                    div_add = $('<div class="container_add_my grid-3 no-margin"></div>');
                    span_add_f = $('<span class="add_my_titles grid-3 no-margin"></span>');
                    span_add_l = $('<span class="add_my_titles grid-3 no-margin"></span>');
                    span_add_p = $('<span class="add_my_titles grid-3 no-margin"></span>');
                    span_add_f.append('Añadir a mis favoritos');
                    span_add_l.append('Añadir a mis libros leídos');
                    span_add_p.append('Añadir a mis libros por leer');
                    span_add_f.append('<input type="hidden" class="list_f" value="0" />');
                    span_add_l.append('<input type="hidden" class="list_l" value="0" />');
                    span_add_p.append('<input type="hidden" class="list_p" value="0" />');
                    div_add.append(span_add_f);
                    div_add.append(span_add_l);
                    div_add.append(span_add_p);
                    if(type == 1 | type == 3)
                        item_title.append(div_add);
                    if(type==4)
                        div_item.append('<input type="hidden" class="my_list" value="0" />');

                    container.append(item_title);

                    if(i == (titles.length-1)){
                        bar = true;
                    }
                    count_id++;
                }
            });
        }

    }else{

    author_l = data[0];
    var array_ids_apis = [];
    if('response' in author_l)
        delete author_l['response'];

    if(type !=1){

        $.each(author_l,function(i){
            array_ids_apis.push(author_l[i].id_api);
            item_title = $('<span class="item_ti item_title_' + count_id + '"></span>')
            type_add = 'grid-5';
            if(type==4)
                type_add = 'grid-4 selec_item d-item_mini_list';

            div_item = $('<div class="d-item_book_mini ' + type_add + ' no-margin"></div>');
            item_title.append(div_item);
            item_title.append('<input type="hidden" class="title_inte" value="1"/>');
            item_title.append('<input type="hidden" class="id_tit" value="' +
                author_l[i].id + '"/>');
            span_wrapper =  $('<span class="wrapper_list wrapper_title_mini border_author" ></span>');
            div_item.append(span_wrapper);
            url_mini = '' + author_l[i].picture;
            url = '' + author_l[i].picture;
            var obj = {
                'title':author_l[i].name
            }

            array.push(obj);

            img_wrapper = $('<img class="img_size_all" src="'+url_mini+'"/></span>');
            span_wrapper.append(img_wrapper);

            type_add = 'grid-3';
            if(type==4)
                type_add = 'grid-2';

            div_container_text = $('<div class="d-container_text_book ' +
                type_add + ' no-margin"></div>');
            div_item.append(div_container_text);
            item_title.append(div_item);
            a = $('<a title="'+author_l[i].name+'" class="title title_book_mini alpha ' + type_add + '"></a>');
            a.append(truncText(author_l[i].name,13));
            div_container_text.append(a);
            p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                ' no-margin" ></p>');
            a_author = $('<a class="title_author" ></a>');
            var author_att= '';
            a_author.append(author_att);
            p_text_author.append('Títulos');
            p_text_author.append(a_author);
            div_container_text.append(p_text_author);
            container_stars = $('<span class="grid-3 no-margin"></span>');

            var grade = 5;
            for(var index = 0;index<5;index++){
                if(index<grade){
                    container_stars.append('<img class="fleft" src="/static/img/comunityStar.png" />');
                }else{
                    container_stars.append('<img class="fleft" src="/static/img/backgroundStar.png" />');
                }
            }

            div_container_text.append(container_stars);
            div_add = $('<div class="container_add_my grid-3 no-margin"></div>');
            span_add_f = $('<span class="add_my_titles grid-3 no-margin"></span>');
            span_add_l = $('<span class="add_my_titles grid-3 no-margin"></span>');
            span_add_p = $('<span class="add_my_titles grid-3 no-margin"></span>');
            span_add_f.append('Añadir a mis favoritos');
            span_add_l.append('Añadir a mis libros leídos');
            span_add_p.append('Añadir a mis libros por leer');
            span_add_f.append('<input type="hidden" class="list_f" value="0" />');
            span_add_l.append('<input type="hidden" class="list_l" value="0" />');
            span_add_p.append('<input type="hidden" class="list_p" value="0" />');
            div_add.append(span_add_f);
            div_add.append(span_add_l);
            div_add.append(span_add_p);

            if(type == 1 | type == 3)
                item_title.append(div_add);
            if(type==4)
                div_item.append('<input type="hidden" class="my_list" value="0" />');

            container.append(item_title);

            if(i == (author_l.length-1)){
                bar = true;
            }
            count_id++;

        });
    }
    if(data.length > 1 & data[1] != null){

            data = data[1];
            var author = data['result_api']['result'];

            $.each(author,function(i){
                var id_api_exist = false;
                $.each(array_ids_apis,function(ind){
                    if(array_ids_apis[ind]==author[i].id){
                        id_api_exist = true;
                    }
                });

                if(!id_api_exist){

                    attribute = author[i]['output'];
                    item_title = $('<span class="item_ti item_title_' + count_id + '"></span>')

                    type_add = 'grid-5';
                    if(type==4)
                        type_add = 'grid-4 selec_item d-item_mini_list';

                    div_item = $('<div class="d-item_book_mini ' + type_add + ' no-margin"></div>');
                    item_title.append(div_item);
                    item_title.append('<input type="hidden" class="title_inte" value="0"/>');
                    span_wrapper =  $('<span class="wrapper_list wrapper_title_mini border_author" ></span>');
                    div_item.append(span_wrapper);
                    url = '/static/img/create.png';

                    if( "/common/topic/image" in attribute ){
                        img_a = attribute['/common/topic/image'];
                        if('/common/topic/image' in img_a)
                            url = 'https://www.googleapis.com/freebase/v1/image' +
                                attribute['/common/topic/image']['/common/topic/image'][0]['mid'];
                    }

                    desc = '';
                    if('description' in attribute)
                        desc  = ''+attribute['description']['/common/topic/description'];

                    var obj = {
                        'name': author[i].name,
                        'picture': url,
                        'biography': desc,
                        'id_api': author[i].id
                    }

                    array.push(obj);

                    img_wrapper = $('<img class="img_size_all" src="'+url+'"/></span>');
                    span_wrapper.append(img_wrapper);

                    type_add = 'grid-3';
                    if(type==4)
                        type_add = 'grid-2';

                    div_container_text = $('<div class="d-container_text_book ' +
                        type_add + ' no-margin"></div>');
                    div_item.append(div_container_text);
                    item_title.append(div_item);
                    a = $('<a title="'+author[i].name+'" class="title title_book_mini alpha ' + type_add + '"></a>');
                    a.append(truncText(author[i].name,13));
                    div_container_text.append(a);
                    p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                        ' no-margin" ></p>');
                    a_author = $('<a " class="title_author" ></a>');
                    var author_att= attribute['authors'];
                    a_author.append(author_att);
                    var count_titles = 0;
                    if('/book/author/works_written' in attribute){
                        count_t = attribute['/book/author/works_written'];
                        if('/book/author/works_written' in count_t)
                            count_titles =  count_t['/book/author/works_written'].length;
                    }

                    p_text_author.append(count_titles + ' titulos');
                    p_text_author.append(a_author);
                    div_container_text.append(p_text_author);
                    container_stars = $('<span class="grid-3 no-margin"></span>');

                    var grade = 5;
                    for(var index = 0;index<5;index++){

                        container_stars.append('<img class="fleft" src="/static/img/backgroundStar.png" />');
                    }

                    div_container_text.append(container_stars);
                    div_add = $('<div class="container_add_my grid-3 no-margin"></div>');
                    span_add_f = $('<span class="add_my_titles grid-3 no-margin"></span>');
                    span_add_l = $('<span class="add_my_titles grid-3 no-margin"></span>');
                    span_add_p = $('<span class="add_my_titles grid-3 no-margin"></span>');
                    span_add_f.append('Añadir a mis favoritos');
                    span_add_l.append('Añadir a mis libros leídos');
                    span_add_p.append('Añadir a mis libros por leer');
                    span_add_f.append('<input type="hidden" class="list_f" value="0" />');
                    span_add_l.append('<input type="hidden" class="list_l" value="0" />');
                    span_add_p.append('<input type="hidden" class="list_p" value="0" />');
                    div_add.append(span_add_f);
                    div_add.append(span_add_l);
                    div_add.append(span_add_p);
                    if(type == 1 | type == 3)
                        item_title.append(div_add);
                    if(type==4)
                        div_item.append('<input type="hidden" class="my_list" value="0" />');

                    container.append(item_title);

                    if(i == (author.length-1)){
                        bar = true;
                    }
                    count_id++;
                }
            });
        }
    }
        $('.add_my_titles').click(function(){

            if(parseInt($(this).find('input').val())==0){
                $(this).find('input').val(1);
                $(this).addClass('active_add_title');
            }else{
                $(this).find('input').val(0);
                $(this).removeClass('active_add_title');
                $(this).removeClass('active_add_title');
            }
        });

            div_text.find('.btn_save').remove();
            div_btn_save = $('<div class="btn_save grid-4 fright no-margin"></div>');
            if(count_id!==0)
                div_text.append(div_btn_save);
            div_btn_save.append('<span class=" green_btn ">Guardar</span>');


        $('.btn_save').click(function(){

            array_title = [];

            var active_sel = false;

            for(var it = 0;it< ($('.overview .item_ti').length);it++){

                var default_type = [];
                var active_title = false;

                if(parseInt($('.item_title_'+it).find('.list_f').val())==1){
                    default_type.push(0);
                    active_title = true;
                }
                if(parseInt($('.item_title_'+it).find('.list_l').val())==1){
                    default_type.push(1);
                    active_title = true;
                }
                if(parseInt($('.item_title_'+it).find('.list_p').val())==1){
                    default_type.push(2);
                    active_title = true;
                }

                if(parseInt($('.item_title_'+it).find('.selec_item').find('input').val())==1){
                    default_type.push(4);
                    active_title = true;
                }

                if(active_title){
                    active_sel = true;
                    title_json = {};
                    if(parseInt($('.item_title_'+it).find('.title_inte').val())==1){
                        title_json = {it:{
                            'attribute':array[it],
                            'default_type':default_type,
                            'id':parseInt($('.item_title_'+it).find('.id_tit').val())
                        }};
                    }else{
                       title_json = {it:{
                            'attribute':array[it],
                            'default_type':default_type,
                           'id':-1
                        }};
                    }

                    array_title.push(title_json);
                }
            }

            if(active_sel){
                div_btn_save.fadeOut(200);
                div_scroll.empty();
                container_loading = $('<div class="loading grid-8"></div>');
                icon_loading = $('<div class="icon_loading"></div>');
                div_scroll.append(container_loading);
                container_loading.append(icon_loading);
                icon_loading.append('<img src="/static/img/loading.gif" class="img_size_all" />');
                add_my_title(csrf,array_title,type);
            }
        });
        $('.dialog-confirm').fadeIn(100);
        $('.container_message').fadeIn(100);
        aling_message();
        selec_item();
        if($('.dialog_text #scrollbar1').length>0)
            $('.dialog_text #scrollbar1').tinyscrollbar();

}
function add_my_title(csrf, array_title, type){

    var type_list = 'T';
    if($('.d_type_list').length > 0)
        type_list  = $('.d_type_list').val();

    if($('.type_list').length > 0)
        type_list  = $('.type_list').val();

    edit_list = 0;
    if($('.my_list_id').length > 0){
        edit_list = parseInt($('.my_list_id').val());
    }
    $.ajax({
        type: "POST",
        url: '/registry/add_my_title/',
        data: {
            'csrfmiddlewaretoken': csrf,
            'list':JSON.stringify(array_title),
            'type':type,
            'type_list':type_list,
            'edit_list':edit_list
        },
        dataType: 'json'
    }).done(function(data){
            if(type == 1 | type == 3){
                //book_favorite
                $.each(data,function(i){
                    title = data[i];

                    container_list = $('.'+i);
                        type = 0;
                    if(i=='book_read')
                        type = 1;
                    if(i=='book_for_reading')
                        type = 2;

                    container_list.find('.d-item_book').remove();
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
                            'value="' + type + '"/>');
                        input_rel = $('<input type="hidden" value="'+ title[i2].id_list +'" class="id_list_rel">');
                        a_ref = $('<a href="'+href+'"></a>');
                        a_wrapper = $('<a href="'+href+'"></a>');
                        span = $('    <span class="wrapper_list borde_author" ></span>');
                        img = $('<img class="img_size_all" src="'+title[i2].cover +
                            '"/>');
                        div_text = $('<div class="d-container_text_book grid-3 no-margin"></div>');
                        a_t = $('<a title="' + title[i2].title +'" href="' + href +
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
                        text_com = 'añadido ';
                        if(i=='book_read')
                            text_com = 'leído ';
                        p_date = $('<p class="p-d-text d-text_opacity">' + text_com +
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
                        if(i=='book_read')
                            div_text.append(btn_edit);
                        btn_del.append(input_type);
                        div_add = container_list.find('.d-container_add_book');
                        div_add.after(div);

                    });
                    container_list.find('.grid-15').find('.all_book').find('input').val(1);
                });
                disable_link_all(true);
            }

            if(type==4)
                get_titles_authors(data, csrf);

            if(type==5){
                $('.title_act_read').fadeOut(250,function(){
                    $(this).remove();
                });
                p = $('<p class="title_act_read">Acualmente está leyendo</p>');
                a_author = $('<a class="title_author"></a>');
                a_author.append(truncText(data.name,10));
                span_btn = $('<span class="green_btn message_alert">Editar</span>');
                input_l = $('<input class="type_message" type="hidden" value="edit_title_read">');
                input_id = $('<input class="id_list" type="hidden" value="' + data.id_list + '">');
                input_nam = $('<input class="name_title" type="hidden" value="' + data.name + '">');
                span_btn.append(input_l);
                span_btn.append(input_id);
                span_btn.append(input_nam);
                p.append(a_author);
                p.append(span_btn);
                $('.general-info').append(p);

            }

            $('.dialog-confirm').fadeOut(250);
            $('.container_message').fadeOut(250);
            show_dialog();

    });


}

function get_titles_authors(list, csrf){

    list_ids = new Array();

    $.each(list,function(i){
        list_ids.push(list[i]);
    });

    var query = {
        'pk__in': JSON.stringify(list_ids) //(como en django para la busqueda de pk)
    }

    var type_list = 'T';

    if($('.d_type_list').length > 0)
        type_list = $('.d_type_list').val();

    if($('.type_list').length > 0)
        type_list = $('.type_list').val();

    if(type_list == 'T'){
        fields = ['title', 'cover', 'id']; //campos en los que bas a buscar
        and = 1; //is es un query tipo and o tipo or
        join = { //(las tablas con las que haces relacion)
            'tables':{
                0: JSON.stringify(['account.author','account.authortitle']),
                1: JSON.stringify(['account.rate'])
            },
            'quieres':{
                0: JSON.stringify(['title_id']),
                1: JSON.stringify(['element_id'])
            },
            'fields':{
                0: JSON.stringify(['name']),
                1: JSON.stringify(['grade'])
            },
            'activity':{
                0: JSON.stringify(['T'])
            }
        }
        join = JSON.stringify(join);

        search = {
            'type': 'account.title',
            'fields': JSON.stringify(fields),
            'value': JSON.stringify(query),
            'and': and,
            'join': join
        }

        search = JSON.stringify(search);

        title = advanced_search(search,csrf);
        container_list = $('.add_my_list');
        container_list.find('.type').remove();
        type = $('<input class="type" type="hidden" ' +
            'value="List"/>');
        container_list.append(type);
        $.each(title,function(i2){
            if(container_list.find('.d-item_'+title[i2].id).length==0){
                div = $('<div class="d-item_book d-item_' + title[i2].id +
                    ' grid-5 no-margin"></div>');
                input_id =$('<input type="hidden" class="id_title"' +
                    'value="'+title[i2].id+'"/>');
                input_title =$('<input type="hidden" class="name_title"' +
                    'value="'+title[i2].title+'"/>');
                input_list = $('<input type="hidden" class="type_list"' +
                    'value="type_list"/>');
                span = $('    <span class="wrapper_list" ></span>');
                img = $('<img class="img_size_all" src="'+title[i2].cover +
                    '"/>');
                div_text = $('<div class="d-container_text_book grid-3 no-margin"></div>');
                a_t = $('<a title="' + title[i2].title + '" class="title title_book alpha grid-4 "></a>');
                a_t.append(truncText(title[i2].title,15));
                name_author = '<p class="p-d-text place_pink" >anonimo</a>';
                if(title[i2].extras[1].length!=0)
                    name_author = '<p class="p-d-text" >De <a class="place_pink" >' +
                        truncText(title[i2].extras[1][0],12)+'</a></p>';

                p_author = $(name_author);
                span_rate = $('<span class="grid-3 no-margin "></span>');
                btn_del = $('<span class="pink_btn size_btn_edit message_alert">-</span>');
                input_type = $('<input class="type_message" type="hidden" ' +
                    'value="delete_title_list"/>');
                span_stars = $('<span class="grid-3 no-margin marg_bot"></span>');
                for(ind = 0;ind<5;ind++){
                    if(ind<title[i2].extras[0][0])
                        span_stars.append('<img src="/static/img/comunityStar.png">');
                    else
                        span_stars.append('<img src="/static/img/backgroundStar.png">');
                }
                span.append(img);
                div.append(input_id);
                div.append(input_title);
                div.append(input_list);
                div.append(span);
                div.append(div_text);
                div_text.append(a_t);
                div_text.append(p_author);
                div_text.append(span_stars);
                div_text.append(btn_del);
                btn_del.append(input_title);
                div_add = container_list.find('.d-container_add_book');
                div_add.after(div);
            }
        });
    }else{
        //query = {'name__icontains':'carlos'}
        model = 'account.author';
        fields = ['name','id','picture'];
        and = 0;
        join = {
            'tables':{
                0: JSON.stringify(['account.author','account.authortitle']),
                1: JSON.stringify(['account.rate'])
            },
            'quieres':{
                0: JSON.stringify(['title_id']),
                1: JSON.stringify(['element_id'])
            },
            'fields':{
                0: JSON.stringify(['name']),
                1: JSON.stringify(['grade'])
            },
            'activity':{
                0:JSON.stringify(['A'])
            }
        }

        join = JSON.stringify(join);

        search = {
            'type': model,
            'fields': JSON.stringify(fields),
            'value': JSON.stringify(query),
            'and': and,
            'join': join
        }
        search = JSON.stringify(search);

        title = advanced_search(search,csrf);

        container_list = $('.add_my_list');
        container_list.find('.type').remove();
        type = $('<input class="type" type="hidden" ' +
            'value="List"/>');
        container_list.append(type)

        $.each(title,function(i2){
            if(container_list.find('.d-item_'+title[i2].id).length==0){
                div = $('<div class="d-item_book d-item_' + title[i2].id +
                    ' grid-5 no-margin"></div>');
                input_id =$('<input type="hidden" class="id_title"' +
                    'value="'+title[i2].id+'"/>');
                input_title =$('<input type="hidden" class="name_title"' +
                    'value="'+title[i2].name+'"/>');
                input_list = $('<input type="hidden" class="type_list"' +
                    'value="type_list"/>');
                span = $('    <span class="wrapper_list" ></span>');
                img = $('<img class="img_size_all" src="'+title[i2].picture +
                    '"/>');
                div_text = $('<div class="d-container_text_book grid-3 no-margin"></div>');
                a_t = $('<a title="'+title[i2].name+'" class="title title_book alpha grid-4 "></a>');
                a_t.append(truncText(title[i2].name,15));
                p_author = $('<p class="p-d-text" > </p>');
                span_rate = $('<span class="grid-3 no-margin"></span>');
                btn_del = $('<span class="pink_btn size_btn_edit message_alert">-</span>');
                input_type = $('<input class="type_message" type="hidden" ' +
                    'value="delete_title_list"/>');
                span.append(img);
                div.append(input_id);
                div.append(input_title);
                div.append(input_list);
                div.append(span);
                div.append(div_text);
                div_text.append(a_t);
                div_text.append(p_author);
                div_text.append(btn_del);
                btn_del.append(input_type);
                div_add = container_list.find('.d-container_add_book');
                div_add.after(div);
            }
        });
    }

    if($('.d-paddin_top').length>0)
        $('.d-paddin_top').tinyscrollbar();
}

function show_titles($this){
    div_container = $this.parent().parent().find('.d-paddin_bottom');
    var name = div_container.attr('class');
    name = name.replace('d-paddin_bottom','');
    disable_value =  parseInt($this.find('input').val());
    var count = div_container.find('.d-item_book').length;
    var int = parseInt(((count+1)/3));
    var decimal = ((count+1)/3) - int;
    var item_height = 1;
    if(decimal > 0 )
        item_height = (Math.round(((count+2)/3))) * 160;
    else
        item_height = (Math.round(((count+1)/3))) * 160;

    $this.find('.span_text').empty();
    if(disable_value==0){
        $this.find('input').val(1);
        $this.find('.span_text').append('Ver menos');
    }else{
        $this.find('input').val(0);
        $this.find('.span_text').append('Ver todos');
        item_height = 320;
    }
    div_container.animate({
        'height': item_height
    },250, function() {
        // Animation complete.
    });
}
function show_items($this){

    div_container = $this.parent().parent().find('.over_items');
    var name = div_container.attr('class');
    name = name.replace('over_items','');
    var disable_value =  parseInt($this.find('input').val());
    var count = div_container.find('.item_title').length;
    var item_height = count * 170;

    $this.find('.span_text').empty();

    if(disable_value==0){

        $this.find('input').val(1);
        $this.find('.span_text').append('Ver menos');
    }else{

        $this.find('input').val(0);
        $this.find('.span_text').append('Ver todos');
        if(count > 5)
            item_height = 494;
        else
            item_height = count * 170;
    }

    div_container.animate({
        'height': item_height
    },250, function() {
        // Animation complete.
    });
}
function show_items_left($this){

    div_container = $this.parent().find('.container_titles');
    var disable_value =  parseInt($this.find('input').val());
    var count = div_container.find('.item_title').length;
    var item_height = count * 110;

    $this.find('span').empty();

    if(disable_value==0){

        $this.find('input').val(1);
        $this.find('span').append('Ver menos');
    }else{

        $this.find('input').val(0);
        $this.find('span').append('Ver todos');
        if(count > 3)
            item_height = 336;
        else
            item_height = count * 110;
    }

    div_container.animate({
        'height': item_height
    },250, function() {
        // Animation complete.
    });
}

function change_type_list(){

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

        if($('.type').val()=="List"){
            var type = $(this).find('.type_message').val();

            if(type=="out_group"){

                var group = $(this).parent().find('.name').val();
                group = group.split("_");
                text = '¿ Estás seguro de que deseas abandonar el grupo de ' +
                    group[0] + ' ?';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
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
                list = ' tu lista';
                if(type_list==0){
                    list = ' tus libros favoritos';
                }
                if(type_list==1){
                    list = ' tus libros leídos';
                }
                if(type_list==2){
                    list = ' tus libros por leer';
                }
                text = 'Se eliminará ' + name_title + list;
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);

            }

            if(type=="edit_read"){
                name_title = $(this).find('.name_title').val();
                text = 'Editar libro leído';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
                text2 = ' Fecha en que leíste ' + name_title;
                p_text2 = $('<p class="p_text_mini2">' + text2 + '</p>');
                span_text.append(p_text2);
                input_date = $('<input type="text" class="date_read"/>');
                var date = new Date();
                input_date.val(date.getFullYear() + '-' + (date.getMonth()+1) +
                    '-' + date.getDate());
                span_text.append(input_date);
                input_date.datepicker({
                dateFormat: 'yy-mm-dd',
                maxDate: '0D',
                onSelect: function(dateText) {
                    $('p').find('input.hour-init').val('00:00:00');
                },
                onClose: function( selectedDate ) {
                    $( ".date-end" ).datepicker( "option", "minDate", selectedDate );
                }
                });
            }
            if(type=="edit_title_read"){
                name_title = $(this).find('.name_title').val();
                text = 'Editar qué estoy leyendo actualmente';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
                text2 = '¿ Terminaste de leer ' + name_title + '?';
                p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
                span_text.append(p_text2);
                p_text3 = $('<p class="p_text_mini2">Fecha en que terminaste de leer' +
                    name_title + '</p>');
                span_text.append(p_text3);
                input_date = $('<input type="text" class="date_read"/>');
                var date = new Date();
                input_date.val(date.getFullYear() + '-' + (date.getMonth()+1) +
                    '-' + date.getDate());
                span_text.append(input_date);
                input_date.datepicker({
                    dateFormat: 'yy-mm-dd',
                    maxDate: '0D',
                    onSelect: function(dateText) {
                        $('p').find('input.hour-init').val('00:00:00');
                    },
                    onClose: function( selectedDate ) {
                        $( ".date-end" ).datepicker( "option", "minDate", selectedDate );
                    }
                });
            }
            if(type=="delete_list" | type=="delete_page"){
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

                container_item = 'add_my_list';
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
            btn_acept.click(function(){list_titles_and_author
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
                delete_item(d_list, 'L');
            });
            closet(btn_acept);
        }
        if($(this).find('.type_message').val() == 'out_group'){
            var id_group = $(this).parent().parent().find('.id_group').val();
            $item = $(this).parent().parent();
            btn_acept.click(function(){
                removeUser($item,parseInt($('.sesion_user').val()),3,id_group);
                $item.fadeOut(250,function(){
                    $(this).remove();
                });
            });
            closet(btn_acept);
        }
        if(($(this).find('.type_message').val())=='delete_page'){
            var id_list = $(this).parent().parent().find('.id_list').val();
            btn_acept.click(function(){
                d_list = $('.overview').find('.d-list_' + id_list);
                delete_item(d_list, 'P');
            });
            closet(btn_acept);
        }

        if(($(this).find('.type_message').val()) == 'edit_read'){
            var id = $(this).parent().parent().find('.id_list_rel').val();
            $this = $(this);
            btn_acept.click(function(){
                edit_title_read(id, 1, $this);
            });
            closet(btn_acept);
        }
        if(($(this).find('.type_message').val()) == 'edit_title_read'){
            var id = $(this).find('.id_list').val();
            $this = $(this);
            btn_acept.click(function(){
                edit_title_read(id, 2, $this);
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



function search_titles_and_author_in_api_bd(type, csrf, words){

    var data = [];
    var model = '';
    var fields;
    var and = 0;
    var join;
    var _query;

    if(type == 'T'){

        _query = {
            'title__icontains':words
        }
        model = 'account.title';
        fields = ['title', 'cover', 'id','id_google','description'];
        and = 0;
        join = {
            'tables':{
                0: JSON.stringify(['account.author'])
            },
            'quieres':{
                0: JSON.stringify(['id'])
            },
            'fields':{
                0: JSON.stringify(['name'])
            },
            'activity':{
                0:JSON.stringify(['A'])
            }
        }
    }
    if(type == 'A'){
        _query = {
            'name__icontains': words
        }

        model = 'account.author';
        fields = ['name','id','picture'];
        and = 0;
        join = {
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
            },
            'activity':{
                0:JSON.stringify(['A'])
            }
        }
    }

    //'pk__in': JSON.stringify([127, 126])

    join = JSON.stringify(join);
    var search = {
        'type': model,
        'fields': JSON.stringify(fields),
        'value': JSON.stringify(_query),
        'and': and,
        'join': join
    }
    search = JSON.stringify(search);
    data.push(advanced_search(search, csrf));

    words = words.split(" ");
    var query = {
        'q': JSON.stringify(words),
        'start_index':{
            0: 0
        },
        'type': {
            0: model
        }
    };

    data.push(search_api(csrf, query));
    return data;
}

function d_show_dialog(type_message){

    $('.dialog-confirm').empty();
    div_closet = $('<span class="dialog_closet"></span>');
    closet(div_closet);
    div_text = $('<div class="dialog_text grid-8 no-margin"></div>');
    div_text.append(div_closet);
    $('.dialog-confirm').append(div_text);
    span_text = $('<span></span>');
    text = 'Añadir un nuevo libro';

    if(type_message == 0){
        text = '¿Qué estás leyendo actualmente?';
        text2 = 'Selecciona un libro para añadirlo a tu perfil como libro actual de lectura';
    }

    p_text = $('<p class="p_text_dialog">' + text + '</p>');
    p_text2 = $('<p class="p_text_mini p_mini_book">' + text2 + '</p>');
    span_text.append(p_text);
    span_text.append(p_text2);
    div_text.append(span_text);

    input = $('<input class="input_add_book" type="text"/>');
    span = $('<span class="dark_yello_btn btn_search_book"></span>');
    btn_cancel = $('<span class="dialog_btn_cancel dialog_btn">Cancelar</span>');

    input.keyup(function(){

        csrf = $('.csrf_header').find('input').val();
        words = $(this).val();

        if(words.length != 0 && words.search(/^\s*$/) != 0 && words.length %3 == 0){
            data = search_titles_and_author_in_api_bd('T', csrf, words);
            list_titles_and_author(data, 'T', div_text, type_message);
        }

    });

    div_text.append(input);
    div_text.append(span);

    $('.dialog-confirm').fadeIn(250);
    $('.container_message').fadeIn(250);

    closet(div_closet);
    closet(btn_cancel);
    //closet($('.dialog-confirm').parent().parent());
    aling_message();
}

function list_titles_and_author(data, type, $container, type_message){

    $container.find('#scrollbar1').remove();
    div_scroll = $('<div id="scrollbar1"></div>');
    div_scroll.append('<div class="scrollbar"><div class="track">'+
        '<div class="thumb"><div class="end"></div></div></div></div>');
    min_height = '';
    div_view_port = $('<div class="viewport' + min_height + ' container_title"></div>');
    div_scroll.append(div_view_port);
    container = $('<div class="overview grid-8"></div>');
    div_view_port.append(container);
    $container.append(div_scroll);
    var bar = false;
    var count = 0;
    var array = [];

    if(type == 'T'){

        titles_l = data[0];
        if('response' in titles_l)
            delete titles_l['response'];
        var array_ids_google = [];

        $.each(titles_l,function(i){
            array_ids_google.push(titles_l[i].id_google);
            item_title = $('<span class="item_ti item_title_'+count+' "></span>')

            type_add = 'grid-4 selec_item d-item_mini_list';

            div_item = $('<div class="d-item_book_mini ' + type_add + ' no-margin"></div>');
            item_title.append(div_item);
            item_title.append('<input type="hidden" class="title_inte" value="1"/>');
            item_title.append('<input type="hidden" class="id_tit" value="' +
                titles_l[i].id + '"/>');
            item_title.append('<input type="hidden" class="active" value="0"/>');
            span_wrapper =  $('<span class="wrapper_list wrapper_title_mini border_author" ></span>');
            div_item.append(span_wrapper);
            url_mini = '' + titles_l[i].cover;
            url = '' + titles_l[i].cover;

            var obj = {
                'title':titles_l[i].title
            }

            array.push(obj);

            img_wrapper = $('<img class="img_size_all" src="'+url_mini+'"/></span>');
            span_wrapper.append(img_wrapper);

            type_add = 'grid-2';

            div_container_text = $('<div class="d-container_text_book ' +
                type_add + ' no-margin"></div>');
            div_item.append(div_container_text);
            item_title.append(div_item);
            a = $('<a title="'+titles_l[i].title+'" class="title title_book_mini alpha ' + type_add + '"></a>');
            a.append(truncText(titles_l[i].title,12));
            div_container_text.append(a);
            p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                ' no-margin" ></p>');
            a_author = $('<a class="title_author" ></a>');
            var author_att = titles_l[i].extras[0];
            a_author.append(truncText(author_att,10));
            p_text_author.append('De ');
            p_text_author.append(a_author);
            div_container_text.append(p_text_author);
            container_stars = $('<span class="grid-3 no-margin"></span>');

            var grade = 5;
            for(var index = 0;index<5;index++){
                if(index<grade){
                    container_stars.append('<img class="fleft" src="/static/img/comunityStar.png" />');
                }else{
                    container_stars.append('<img class="fleft" src="/static/img/backgroundStar.png" />');
                }
            }

            div_container_text.append(container_stars);

            div_item.append('<input type="hidden" class="my_list" value="0" />');

            container.append(item_title);

            count++;

            if(i>5)
                bar = true;

        });
        data = data[1];
        if(data['result_api'] != 'No se pudieron encontraron más libros en su búsqueda'){
            var titles = data['result_api']['items'];
            $.each(titles,function(i){
                var id_google_exist = false;
                $.each(array_ids_google,function(ind){
                    if(array_ids_google[ind]==titles[i].id){
                        id_google_exist = true;
                    }
                });
                if(!id_google_exist){
                    attribute = titles[i]['volumeInfo'];
                    attribute_access = titles[i]['accessInfo'];
                    item_title = $('<span class="item_ti item_title_'+count+'"></span>')

                    type_add = 'grid-4 selec_item d-item_mini_list';

                    div_item = $('<div class="d-item_book_mini ' + type_add + ' no-margin"></div>');
                    item_title.append(div_item);
                    item_title.append('<input type="hidden" class="title_inte" value="0"/>');
                    item_title.append('<input type="hidden" class="active" value="0"/>');
                    span_wrapper =  $('<span class="wrapper_list wrapper_title_mini border_author" ></span>');
                    div_item.append(span_wrapper);
                    url = '/static/img/create.png';
                    url_mini = '/static/img/create.png';

                    if( "imageLinks" in attribute ){
                        url_mini = ''+attribute['imageLinks']['smallThumbnail'];
                        url = ''+attribute['imageLinks']['thumbnail'];
                    }

                    pages = 0;
                    if('pageCount' in attribute)
                        pages  = attribute['pageCount'];
                    desc = '';
                    if('description' in attribute)
                        desc  = ''+attribute['description'];

                    isbn = '';
                    isbn13 = '';
                    if('industryIdentifiers' in attribute){
                        if('identifier' in attribute['industryIdentifiers'][0])
                            isbn = attribute['industryIdentifiers'][0]['identifier'];
                        if(attribute['industryIdentifiers'].length >1){
                            if('identifier' in attribute['industryIdentifiers'][1])
                                isbn13 = attribute['industryIdentifiers'][1]['identifier'];
                        }
                    }

                    publisher = '';
                    if('publisher' in attribute)
                        publisher = attribute['publisher'];

                    publishedDate = '2013';
                    if('publishedDate' in attribute)
                        publisher = attribute['publishedDate'];

                    language = '';
                    if('language' in attribute)
                        language = attribute['language'];

                    country = '';
                    if('country' in attribute)
                        country = attribute_access['country'];

                    var obj = {
                        'title': attribute['title'],
                        'author': attribute['authors'],
                        'cover': url,
                        'description': desc,
                        'publisher': publisher,
                        'publishedDate': publishedDate ,
                        'language': language,
                        'country': country,
                        'isbn': isbn,
                        'isbn13': isbn13,
                        'pages': pages,
                        'picture': url_mini,
                        'id_google': titles[i].id
                    }

                    array.push(obj);

                    img_wrapper = $('<img class="img_size_all" src="'+url_mini+'"/></span>');
                    span_wrapper.append(img_wrapper);
                    type_add = 'grid-2';

                    div_container_text = $('<div class="d-container_text_book ' +
                        type_add + ' no-margin"></div>');
                    div_item.append(div_container_text);
                    item_title.append(div_item);
                    a = $('<a title="'+attribute['title']+'" class="title title_book_mini alpha ' + type_add + '"></a>');
                    a.append(truncText(attribute['title'],12));
                    div_container_text.append(a);
                    p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                        ' no-margin" ></p>');
                    a_author = $('<a " class="title_author" ></a>');
                    var author_att = 'autor anonimo';
                    if('authors' in attribute){
                        author_att = attribute['authors'];
                        author_att = truncText(author_att[0],10)
                    }

                    a_author.append(author_att);
                    p_text_author.append('De ');
                    p_text_author.append(a_author);
                    div_container_text.append(p_text_author);
                    container_stars = $('<span class="grid-3 no-margin"></span>');

                    var grade = 5;
                    for(var index = 0;index<5;index++){
                        if(index<grade){
                            container_stars.append('<img class="fleft" src="/static/img/comunityStar.png" />');
                        }else{
                            container_stars.append('<img class="fleft" src="/static/img/backgroundStar.png" />');
                        }
                    }
                    div_container_text.append(container_stars);

                    container.append(item_title);

                    count++;
                    if(i > 6)
                        bar = true;
                }
            });
        }
    }
    if(bar)
        div_scroll.tinyscrollbar();

    if(type_message == 0){

        var title_active = 0;
        var acti = false;

        $('.item_ti').click(function(){
            var item_act = $(this).find('.selec_item').hasClass('active_item');

            if(!acti & !item_act){
                $(this).find('.selec_item').addClass('active_item');
                title_active = parseInt($(this).find('.id_tit').val());
                acti = true;
            }else if(acti & item_act){
                acti = false;
                $(this).find('.selec_item').removeClass('active_item');
                title_active = 0;

            }


        });
    }
    div_text.find('.btn_save').remove();
    div_btn_save = $('<div class="btn_save grid-4 fright no-margin"></div>');
    var span_save;
    if(count!==0)
        div_text.append(div_btn_save);
        span_save = $('<span class=" green_btn " >Guardar</span>');
        div_btn_save.append(span_save);

    span_save.click(function(){

    array_title = [];

            var active_sel = false;

            for(var it = 0;it< ($('.overview .item_ti').length);it++){

                var active_title = false;

                if($('.item_title_'+it).find('.d-item_book_mini').hasClass('active_item')){
                    active_title = true;
                }

                if(active_title){
                    active_sel = true;
                    title_json = {};
                    if(parseInt($('.item_title_'+it).find('.title_inte').val())==1){
                        title_json = {it:{
                            'attribute':array[it],
                            'default_type':[5],
                            'id':parseInt($('.item_title_'+it).find('.id_tit').val())
                        }};
                    }else{
                       title_json = {it:{
                            'attribute':array[it],
                            'default_type':[5],
                            'id':-1
                        }};
                    }

                    array_title.push(title_json);
                }
            }

        var csrf = $('.csrf_header').find('input').val();
        if(active_sel){
            div_btn_save.fadeOut(200);
            add_my_title(csrf,array_title,5);
        }
    });
    $container.append();
}

function show_upload($this){
    var cover = 0;
    if($this.hasClass('cover'))
        cover = 1;
    $.ajax({
        type: "POST",
        url: '/registry/delete_picture/',
        data: {
            'csrfmiddlewaretoken': $('.csrf_header').find('input').val(),
            'type': $('.type').val(),
            'id': $('.id_object').val(),
            'cover': cover
        },
        dataType: 'json'
    }).done(function(data){
            if(data.succes == 'True')
                load_img_profile();
        });

    $this.fadeOut(250, function(){

        $this.parent().find('.wrapper_picture_user').fadeOut(250,function(){
            $this.parent().find('.dropzone_user').fadeIn(250);
        });
    });
}

function disable_link_all(user_active){
    var count = 6;
    if(user_active)
        count = 5;
    $.each($('.overview  div .d-paddin_bottom'),function(){

        var text = 'libros favoritos';

        if($(this).hasClass('book_read')){
            text = 'libros leídos';
            $('.count_titles_read').html($(this).find('.d-item_book').length +
                ' libros leídos');
        }
        if($(this).hasClass('book_for_reading'))
            text = 'libros por leer';
        $(this).find('.no_title').remove();

        if($(this).find('.d-item_book').length == 0)
            $(this).append('<span class="grid-9 place_pink no_title">' +
              'Añade tus ' + text + '</span>');

        if($(this).find('.d-item_book').length > count){
            $(this).parent().find('.all_book').fadeIn(250);
            $(this).parent().find('.all_book').find('.span_text').html('Ver todos');
            $(this).parent().find('.all_book').find('input').val(0);
        }else{
            $(this).parent().find('.all_book').find('.span_text').html('Ver todos');
            $(this).parent().find('.all_book').find('input').val(0);
            $(this).parent().find('.all_book').fadeOut(250);
        }
        min_height = 320;
        if($(this).find('.d-item_book').length <= 2)
            min_height = 152;
        $(this).animate({
            'height': min_height
        },250, function() {
            // Animation complete.
        });
    });
}

function show_index_items($this){
    var count = 1;

    $.each($this.parent().find('.my_items'),function(){

        if($this.find('input').val() == '1'){
            $(this).fadeIn(250);
        }else{
            if(count > 3)
                $(this).fadeOut(250);
        }
        count++;

    });

    if($this.find('input').val() == '1'){
        $this.find('input').val('0');
        $this.find('span').html('Ver menos');
    }else{
        $this.find('input').val('1');
        $this.find('span').html('Ver más');
    }
}