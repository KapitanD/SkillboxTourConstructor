ymaps.ready(init);

function init() {
        // Создание карты.
        window.myMap = new ymaps.Map("map", {
                // Координаты центра карты.
                // Порядок по умолчанию: «широта, долгота».
                // Чтобы не определять координаты центра карты вручную,
                // воспользуйтесь инструментом Определение координат.
                center: [55.76, 37.64],
                // Уровень масштабирования. Допустимые значения:
                // от 0 (весь мир) до 19.
                zoom: 8
        });
}

$(function () {

        $('#getPointsButton').on('click', function () {
                var cityName = $('#city').val();

                //Take city and center map to it
                var myGeocoder = ymaps.geocode(cityName);
                myGeocoder.then(function (res) {
                        var geoObject = res.geoObjects.get(0);
                        if (geoObject) {
                                var coords = geoObject.geometry._coordinates;

                                console.log(coords);

                                window.myMap.setCenter(coords, 12);
                        }
                }, function (err) {
                        // Обработка ошибки.
                });

                //Take POIs
                var searchQuery = cityName + ' достопримечательности';
                $.get('https://search-maps.yandex.ru/v1/?apikey=1355b8b1-6de3-446c-93f1-ea1c8db4a614&lang=ru_RU&results=100&text=' +
                        searchQuery, {},
                        function (response) {
                                for (var i in response.features) {
                                        var feature = response.features[i];
                                        var coordinates = feature.geometry.coordinates.reverse();
                                        var metaData = feature.properties.CompanyMetaData;
                                        var myPlacemark = new ymaps.Placemark(
                                                coordinates, {
                                                        balloonContentHeader: feature.properties.name,
                                                        balloonContentBody: metaData.address,
                                                        balloonContentFooter: '<a href="#" data-name="' +
                                                                feature.properties.name + '" data-category="' +
                                                                metaData.Categories[0].class + '" data-lat="' +
                                                                coordinates[0] + '" data-lng="' + coordinates[1] +
                                                                '" class="add-to-route">Добавить в маршрут</a>',
                                                        hintContent: feature.properties.name
                                                }
                                        );

                                        myMap.geoObjects.add(myPlacemark);
                                }

                        });

                $(document).on('click', '.add-to-route', function () {
                        $('#route i').hide();
                        $('#routeFooter').show();
                        var data = $(this).data();
                        $('<div class="routeItem">' + data.name + '</div>')
                                .data(data).appendTo($('#route'));
                        return false;
                });

                $('#saveRouteButton').on('click', function () {
                        var tripName = $('#tripName').val();
                        if (tripName.length == 0) {
                                alert('Имя маршрута не задано!');
                                return;
                        }
                        var request = {
                                name: tripName,
                                //date: "12 May 2020",
                                city: $('#city').val(),
                                points: []
                        };
                        $('.routeItem').each(function () {
                                request.points.push($(this).data());
                        });
                        $.post('/saveTrip/', request, function (response) {
                                $('#savedRoutes i').remove();
                                $('<div class="savedTrip"><a data-id="' + response.trip_id + '" href="#">' + tripName + '</a></div>');
                                $('#savedRoutes').append();

                                $('.routeItem').remove();
                                $('#route i').show();
                                $('#routeFooter').hide();
                        });
                });

                $(document).on('click', '.savedTrip', function () {
                        //TODO: get points from server and show them on the map
                });
        });
});