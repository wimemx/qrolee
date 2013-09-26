var content_search_entity = false;
var header_search_entity = false;
var entity_search_events = false;
var months = ['Enero','Febrero','Marzo','Abril',
    'Mayo','Juno','Julio','Agosto','Septiembre','Octubre',
    'Noviembre','Diciembre'];
var days = ['lunes','martes','miercoles',
    'jueves','viernes','sabado','domingo'];
var site_url = window.location.origin;

function text_no_found(){
    $('.d-not_found').fadeOut(250,function(){
        $(this).remove();
    });
    type = '';
    div_width = 'grid-13';
    if($('.type').val()=='organization')
        type = 'organizaciones';
    if($('.type').val()=='group')
        type = 'grupos';
    if($('.type').val()=='spot'){
        type = 'spots';
        div_width = 'grid-7';
    }

    div = $('<div class="d-not_found ' + div_width + '" ></div> ');
    div.append('No encontraron ' + type);
    $('.overview').append(div);
    div.fadeIn(300);
}

function init(lat,long) {
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
	var companyLogo = new google.maps.MarkerImage('/static/img/gmap_marker.png',
		new google.maps.Size(100,50),
		new google.maps.Point(0,0),
		new google.maps.Point(50,50)
	);
	var companyPos = new google.maps.LatLng(lat,long);
	var companyMarker = new google.maps.Marker({
		position: companyPos,
		map: map,
		icon: companyLogo,
		title:"Qro Lee"
	});
	map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
 }

var geocoder;
var map;
var marker;
	function initialize(lat,long) {
			var latlng = new google.maps.LatLng(20.600008,-100.388363);
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


$(document).ready(function(){

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

    $('.sidebar-b .controller .next').click(function(){

         if( curr_month<11 ){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;

            $('.sidebar-b .year tr').animate({
                'left':left-125
            });

        }
    });
    $('.sidebar-b .controller .prev').click(function(){
        if(curr_month>0){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;
            $('.sidebar-b .year tr').animate({
                'left':left+125

            });
        }
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
    $('span.settings').click(function(){

        if($(this).find('.sub-menu').is(':visible'))
            $(this).find('.sub-menu').fadeOut(300);
        else
            $(this).find('.sub-menu').fadeIn(300);
    });
    $('span.link_book').click(function(){
        if($(this).find('.sub-menu-book').is(':visible'))
            $(this).find('.sub-menu-book').fadeOut(300);
        else
            $(this).find('.sub-menu-book').fadeIn(300);
    });


    $('p.fb').click(function(){
            var search = '/me/groups?fields=cover,link,description,name,privacy,id';
            if($(this).hasClass('organization'))
                search = '/me/accounts?fields=description,name,location,perms,category,username,website,picture,cover';
            if($(this).hasClass("update"))
                fb_obj_search(search, -1);
            else
                fb_obj_search(search);
        });

    $('.radio_btn').click(function(){
        $('.d-add_text_book').empty();
        $('.title_list').empty();
        $('.add_my_list').find('.d-item_book').remove();
        if($(this).parent().find('.radio_value').val()=='title'){
            $('.rad_tit').addClass('radio_active');
            $('.rad_aut').removeClass('radio_active');
            $('.active_title').val(1);
            $('.active_author').val(0);
            $('.type_list').val('T');
            $('.title_list').append('Libros de tu lista');
            $('.d-add_text_book').append('+ Añadir un nuevo libro');
        }else{
            $('.rad_aut').addClass('radio_active');
            $('.rad_tit').removeClass('radio_active');
            $('.active_title').val(0);
            $('.active_author').val(1);
            $('.type_list').val('A');
            $('.title_list').append('Autores de tu lista');
            $('.d-add_text_book').append('+ Añadir un nuevo autor');
        }
    });
});

function fb_obj_search(search, type){
    $('.lightbox-wrapper .fb-objs span').each(function(){
            $(this).remove();
        });
        $('.lightbox-wrapper').fadeIn(300);
        FB.api(search, function(response) {
            var len = response.data.length;
            $.each(response.data,function(index){
                var obj = response.data[index];
                var id = obj.id;
                var span = $('<span class="fleft grid-5"></span>');
                var span_wrapper = $('<span class="fleft wrapper"><img src="" ></span>');
                var title = $('<h3 class="title grid-3 fright"></h3>');
                var privacy = $('<p class="grid-3 fright"></p>');
                var link = $('<p class="grid-3 fright"></p>');
                var span_accept = $('<span class="green_btn fright">Acceptar</span>');
                if(obj.cover)
                    span_wrapper.find('img').attr('src',obj.cover.source);
                if(obj.link)
                    link.html(obj.link);
                var web;
                if(obj.link){
                    link.html(obj.link);
                    web = obj.link;
                }
                if(obj.website){
                    link.html(obj.website);
                    web = obj.website;
                }

                title.html(obj.name);
                privacy.html(obj.privacy);
                span.append(span_wrapper);
                span.append(title);
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
                    clear_input(['submit','picture','cover_picture','csrfmiddlewaretoken','entity_type']);
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
                    if(web)
                        $('input[name=website]').val(web);
                    if(obj.location){
                        var address = obj.location.street+' '+
                            obj.location.city+' '+obj.location.country;
                        if(obj.location.latitude){
                            address = new Array();
                            address.push(obj.location.latitude);
                            address.push(obj.location.longitude);
                            update_dir_info(null, address,1);
                        }else{
                            update_dir_info(address, null, 1);
                        }

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
            });
        }
    }
};

function dmap(data,id){

        var styles = [
        {
        stylers: [
            { hue: "#b3d4fc" },
            { saturation: -20 }
          ]
        },{
          featureType: "road",
          elementType: "geometry",
          stylers: [
            { lightness: 100 },
            { visibility: "simplified" }
          ]
        },{
        featureType: "road",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
          ]
          }
        ];

        var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

        var latlon = $('.d-latlon').val().split(",");

        var lat = parseFloat(latlon[0]);
        var lon = parseFloat(latlon[1])  ;

        var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(lat,lon),
        mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
        };

        var map = new google.maps.Map(document.getElementById('d-map'),
        mapOptions);


        if(id==1){
            var counter = 0;

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
}


$(document).ready(function(){

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

    $('.sidebar-b .controller .next').click(function(){

         if( curr_month<11 ){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;

            $('.sidebar-b .year tr').animate({
                'left':left-125
            });

        }
    });
    $('.sidebar-b .controller .prev').click(function(){
        if(curr_month>0){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;
            $('.sidebar-b .year tr').animate({
                'left':left+125

            });
        }
    });
    var init_map = false;
    $('.entity .nav .btn').click(function(){
        $(this).parent().find('.btn').each(function(){
           $(this).removeClass('active');
        });
        $(this).addClass('active');
        if($('#map').length > 0){
            if($('.lat').val() != ''){
                if(!init_map)
                    init(parseInt($('.lat').val()),parseInt($('.long').val()));
                init_map = true;
            }else{
                init(-100.4057373,20.6144226);
            }
        }
        var index = $(this).index();
        var len = $('.load').length;
        $('.load').each(function(i){
            if((len-1) == i){
                $(this).fadeOut(300,function(){
                    $('.load:eq('+index+')').fadeIn(300,function(){
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
        if($(this).find('.sub-menu').is(':visible'))
            $(this).find('.sub-menu').fadeOut(300);
        else
            $(this).find('.sub-menu').fadeIn(300);
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
                if($(this).hasClass('map'))
                    $('#map').fadeIn(300,initialize(20.600008,-100.388363));
            });
        }
    });


    $('.filter .checkbox').click(function(){
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
                    'last_name','username'];
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
                        1: JSON.stringify(['title'])
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
            fields = ['name'];
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
        }else if(type == 'account.list'){
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val())
            }
            fields = ['name','picture'];
            join = {
                'tables':{
                    0: JSON.stringify(['auth.user','account.listuser'])
                },
                'quieres':{
                    0: JSON.stringify(['list_id'])
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
            fields = ['name','start_time','end_time','owner_id','picture'];
        }else if(type == 'registry.entity.1' || type == 'registry.entity.3'){

            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(_class[1]);
                }
            });
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
            fields = ['name', 'picture', 'user_id'];
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
            fields = ['name', 'picture', 'user_id'];
        }else if(type == 'registry.entity.2'){
            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(parseInt(_class[1]));
                }
            });
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': 1,
                'privacy__in': JSON.stringify(_in)
            }
            fields = ['name', 'picture', 'user_id', 'privacy'];
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
            fields = ['title', 'cover'];
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
                    0: JSON.stringify(['first_name','last_name']),
                    1: JSON.stringify(['grade'])
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
            var csrf = $('.advanced_filter').find('div input[type=hidden]').val();
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
            if(result.response != 0){
                $.each(result,function(i){
                    create_template(type, result, i, create_user);
                });
            }else{

            }

        }
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
        item.append(wrapper_fleft);
        var img = $('<img src="" attr="">');
        var url = '/static/media/users/'+result[i].user_id+
            '/entity/'+result[i].picture;
        img.attr('src', url);
        wrapper_fleft.append(img);
        var h3 = $('<h3 class="title no-margin grid-4 fright"></h3>');
        if(type == 'account.author' || create_user){
            h3.html(result[i].name);
        }else if(type == 'account.title'){
            h3.html(result[i].title);
        }else{
            h3.html(result[i].name);
        }

        var p = $('<p class="fright no-margin grid-4"></p>');
        item.append(h3);
        if (type == 'registry.entity.2'){
            var privacy;
            if(result[i].privacy == 'False')
                privacy = 'Público';
            else
                privacy = 'Privado';
            p.html(privacy);
            item.append(p);
        }else if(type == 'registry.entity.1' ||
            type == 'registry.entity.3'){
            $.each(result[i].extras,function(indx){
                p = $('<p class="fright no-margin grid-4"></p>');
                p.html(result[i].extras[indx]);
                item.append(p);
            });
        }else if(type == 'account.list'){
            var text= 'Lista creada por ';
            if(result[i].extras[0] != 'None')
                p.html(text+result[i].extras[0]
                    + ' '+ result[i].extras[2] );
            else
                p.html(text+result[i].extras[1]);
            item.append(p);
        }else if(type == 'account.author'){
            p.html(result[i].extras[0].length+' Libros');
            item.append(p);
        }else if(type == 'account.title'){

            var text= '';
            p.html(text+result[i].extras[1][0]
                + ' '+ result[i].extras[1][1]);
            item.append(p);

        }else if(type == 'registry.event'){
            var date = result[i].start_time.split(' ');
            var hour = date[1].split(':');
            date = date[0];
            date = $.datepicker.parseDate("yy-mm-dd",  date);
            var date_string = days[date.getDay()-1]+', '+
                date.getDate()+' de '+months[date.getMonth()-1]+
                ' del '+date.getFullYear()+' '+hour[0]+':'+
                hour[1]+'hrs.';
            p.html(date_string);
            item.append(p);
            url = '/static/media/users/'+result[i].owner_id+
            '/event/'+result[i].picture;
            img.attr('src', url);
        }else if(create_user){
            p.html('Esta leyendo');
            item.append(p);
        }
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
                'csrfmiddlewaretoken': $('.csrf_token').find('div input').val()
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
    'csrfmiddlewaretoken': $('.csrf_token').find('div input').val(),
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

    input = $('<input class="input_add_book" type="text"/>');
    span = $('<span class="dark_yello_btn btn_search_book">Buscar</span>');
    span.click(function(){

        $('.dialog_text').find('#scrollbar1').fadeOut(250,function(){

            $(this).remove();
            var words = $('.input_add_book').val();
            type = 4;
            if(id!=4)
                type = 2;
            type_add_list($('.csrf_token').find('div input').val(), type, words);
        });

    });
    div_text.append(input);
    div_text.append(span);

    list_title(csrf, data, div_text, id);
}


function list_title(csrf, data, div_text, type){

    div_scroll = $('<div id="scrollbar1"></div>');
    div_scroll.append('<div class="scrollbar"><div class="track">'+
        '<div class="thumb"><div class="end"></div></div></div></div>');

    min_height = '';

    if(type==1)
        min_height = ' min_list ';

    div_view_port = $('<div class="viewport' + min_height + ' container_title"></div>');
    div_scroll.append(div_view_port);
    container = $('<div class="overview grid-8"></div>');
    div_view_port.append(container);
    div_text.append(div_scroll);

        array = [];
        console.log(data);
        titles_l = data[0];
        count_id = 0;
        bar = false;

    if(type !=1){

        delete titles_l['response'];

        $.each(titles_l,function(i){
            item_title = $('<span class="item_ti item_title_' + count_id + '"></span>')

            type_add = 'grid-5';
            if(type==4)
                type_add = 'grid-4 selec_item';

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
            a = $('<a class="title title_book_mini alpha ' + type_add + '"></a>');
            a.append((titles_l[i].title).substring(0,15));
            div_container_text.append(a);
            p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                ' no-margin" ></p>');
            a_author = $('<a class="title_author" ></a>');
            var author_att= titles_l[i].extras[1];
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
                attribute = titles[i]['volumeInfo'];
                attribute_access = titles[i]['accessInfo'];
                item_title = $('<span class="item_ti item_title_' + count_id + '"></span>')

                type_add = 'grid-5';
                if(type==4)
                    type_add = 'grid-4 selec_item';

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

                var obj = {
                    'title':attribute['title'],
                    'author':attribute['authors'],
                    'cover':url,
                    'description':desc,
                    'publisher':publisher,
                    'publishedDate':publishedDate ,
                    'language':language,
                    'country':country,
                    'isbn':isbn,
                    'isbn13':isbn13,
                    'pages':pages,
                    'picture':url_mini
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
                a = $('<a class="title title_book_mini alpha ' + type_add + '"></a>');
                a.append((attribute['title']).substring(0,15));
                div_container_text.append(a);
                p_text_author = $('<p class="p-d-text p-d-text-author ' + type_add +
                    ' no-margin" ></p>');
                a_author = $('<a " class="title_author" ></a>');
                var author_att= attribute['authors'];
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

            });
        }
        $('.add_my_titles').click(function(){
            if(parseInt($(this).find('input').val())==0){
                $(this).find('input').val(1);
                $(this).addClass('active_add_title');
            }else{
                $(this).find('input').val(0);
                $(this).removeClass('active_add_title');
            }
        });

            div_text.find('.btn_save').remove();
            div_btn_save = $('<div class="btn_save grid-4 fright no-margin"></div>');
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

            if(active_sel)
                add_my_title(csrf,array_title,type);

        });

        $('.dialog-confirm').fadeIn(250);
        $('.container_message').fadeIn(250);
        if(count_id>2)
            $('#scrollbar1').tinyscrollbar();
        aling_message();
        selec_item();

        //if(type==4)
            //get_titles_authors(csrf);
}

function add_my_title(csrf, array_title, type){
    $.ajax({
        type: "POST",
        url: '/registry/add_my_title/',
        data: {
            'csrfmiddlewaretoken': csrf,
            'list':JSON.stringify(array_title),
            'type':type
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
                        href = '/qro_lee/profile/title/' + name + '_' + title[i2].id + '/';
                        div = $('<div class="d-item_book d-item_' + title[i2].id +
                            ' grid-5 no-margin"></div>');
                        input_id =$('<input type="hidden" class="id_title"' +
                            'value="'+title[i2].id+'"/>');
                        input_title =$('<input type="hidden" class="name_title"' +
                            'value="'+title[i2].title+'"/>');
                        input_list = $('<input type="hidden" class="type_list"' +
                            'value="' + type + '"/>');
                        a_ref = $('<a href="'+href+'"></a>')
                        span = $('    <span class="wrapper_list" ></span>');
                        img = $('<img class="img_size_all" src="'+title[i2].cover +
                            '"/>');
                        div_text = $('<div class="d-container_text_book grid-3 no-margin"></div>');
                        a_t = $('<a href="' + href +
                            '" class="title title_book alpha grid-4 "></a>');
                        a_t.append(truncText(title[i2].title,15));
                        p_author = $('<p class="p-d-text" >De <a href="#" class="place_pink" >' +
                            ' Riber Kars </a></p>');
                        span_rate = $('<span></span>');
                        p_date = $('<p class="p-d-text d-text_opacity">' +
                            title[i2].published_date + '</p>');
                        btn_del = $('<span class="pink_btn size_btn_edit message_alert">-</span>');
                        input_type = $('<input class="type_message" type="hidden" ' +
                            'value="delete_title"/>');
                        span.append(img);
                        div.append(input_id);
                        div.append(input_title);
                        div.append(input_list);
                        div.append(span);
                        div.append(div_text);
                        div_text.append(a_t);
                        div_text.append(p_author);
                        div_text.append(p_date);
                        div_text.append(btn_del);
                        btn_del.append(input_type);
                        div_add = container_list.find('.d-container_add_book');
                        div_add.after(div);

                    });
                    container_list.find('.grid-15').find('.all_book').find('input').val(1);
                });

            }

            if(type==4){
                    get_titles_authors(data, csrf);

            }
            $('.dialog-confirm').fadeOut(250);
            $('.container_message').fadeOut(250);
            show_dialog();

    });
}


function get_titles_authors(list, csrf){

        list_ids = [];
        $.each(list,function(i){
           list_ids.push(list[i]);
        });
            query = {
                'pk__in': JSON.stringify(list_ids) //(como en django para la busqueda de pk)
            }
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
                    0: JSON.stringify(['first_name','last_name']),
                    1: JSON.stringify(['grade'])
                }
            }
            join = JSON.stringify(join); //conviertes el join en un string

            search = {
                'type': 'account.title', //el modelo en el que vas a buscar account.title account.list etc...
                'fields': JSON.stringify(fields),
                'value': JSON.stringify(query),
                'and': and,
                'join': join
            }
            search = JSON.stringify(search); //conviertes el objeto a string
            result = advanced_search(search, csrf);

    title = advanced_search(search,csrf);

    container_list = $('.add_my_list');
    container_list.find('.type').remove();
    type = $('<input class="type" type="hidden" ' +
            'value="List"/>');
    container_list.append(type)

    $.each(title,function(i2){
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
        a_t = $('<a class="title title_book alpha grid-4 "></a>');
        a_t.append(truncText(title[i2].title,15));
        p_author = $('<p class="p-d-text" >De <a class="place_pink" >' +
            ' Riber Kars </a></p>');
        span_rate = $('<span></span>');
        p_date = $('<p class="p-d-text d-text_opacity">' +
            title[i2].published_date + '</p>');
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
        div_text.append(p_date);
        div_text.append(btn_del);
        btn_del.append(input_type);
        div_add = container_list.find('.d-container_add_book');
        div_add.after(div);

    });
}

function show_titles($this){

    div_container = $this.parent().parent();
    var name = div_container.attr('class');
    name = name.replace('d-paddin_bottom','');
    disable_value =  parseInt($this.find('input').val());
    div_container.fadeOut(250,function(){

        $.each($('.' + name + '.d-item_book'),function(i){

            $(this).removeClass('disable_title');
            var disable = '';
            if(disable_value == 1){
                if(i>1)
                    disable = ' disable_title ';
            }
            $(this).addClass(disable);

        });

        div_container.fadeIn(250);
        if(disable_value==0)
            $this.find('input').val(1);
        else
            $this.find('input').val(0);
    });

}


function change_type_list(){

}
