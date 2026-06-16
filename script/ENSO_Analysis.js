
var sst = imageCollection

print(sst.first())

// var current = sst
// .filterDate('2026-01-01','2026-01-31').select('sst')
// .mean();


// var climatology = sst
// .filter(ee.Filter.calendarRange(1,1,'month'))
// .filterDate('1991-01-01','2020-12-31').select('sst')

// .mean();

// var anomaly =
// current.subtract(climatology);

// var stats = current.reduceRegion({
//   reducer: ee.Reducer.minMax(),
//   geometry: pacific,
//   scale: 25000,
//   maxPixels: 1e13
// });

// print('Current SST Stats', stats);


// var vis = {
// min:-3,
// max:3,
// palette:[
// '0000ff',
// '00ffff',
// 'ffffff',
// 'ff9900',
// 'ff0000'
// ]
// };

// Map.addLayer(
// anomaly,
// vis,
// 'SST Anomaly'
// );
// Map.centerObject(pacific, 4)

// print(anomaly)

var nino34 = ee.Geometry.Rectangle(
  [-170, -5, -120, 5]
);

Map.addLayer(
  ee.FeatureCollection([ee.Feature(nino34)])
    .style({
      color: '00FFFF',
      fillColor: '00000000',
      width: 3
    }),
  {},
  'Nino 3.4'
);

print(sst.sort('system:time_start', false).first());

// print(anomaly.bandNames());

var img = ee.Image('NOAA/CDR/OISST/V2_1/20260606');

print(img);

var rawAnom = img.select('anom');

Map.addLayer(rawAnom, {}, 'Raw Anomaly');

var img = ee.Image('NOAA/CDR/OISST/V2_1/20260606');

var anom = img
  .select('anom')
  .multiply(0.01);

Map.addLayer(
  anom,
  {
    min:-3,
    max:3,
    palette:[
      '0000FF',
      '00FFFF',
      'FFFFFF',
      'FFA500',
      'FF0000'
    ]
  },
  'NOAA Anomaly'
);

var nino34 = ee.Geometry.Rectangle(
  [-170, -5, -120, 5]
);

var ninoIndex = anom.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: nino34,
  scale: 25000,
  maxPixels: 1e13
});

print('Nino 3.4 Index', ninoIndex);

print(sst.select('err').first(), 'error')


function getNinoIndex(date){
  
  var img = sst.filterDate(date, ee.Date(date).advance(1, 'month'))
  .select('anom')
  .mean()
  .multiply(0.01);
  
    var index = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: nino34,
    scale: 25000,
    maxPixels: 1e13
  });

  return index.get('anom');
}
  
  
  
  print('1982 Peak', getNinoIndex('1982-06-01'));

print('1997 Peak', getNinoIndex('1997-06-01'));

print('2015 Peak', getNinoIndex('2015-06-01'));

print('2026 Current', getNinoIndex('2026-06-01'));
  
  
function getMonthlyNino(year, month) {

  var start = ee.Date.fromYMD(year, month, 1);
  var end = start.advance(1, 'month');

  var anom = sst
    .filterDate(start, end)
    .select('anom')
    .mean()
    .multiply(0.01);

  var index = anom.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: nino34,
    scale: 25000,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    year: year,
    month: month,
    nino: index.get('anom')
  });
}


var months = ee.List.sequence(1, 12);




var nino1982 = ee.FeatureCollection(
  months.map(function(m){
    return getMonthlyNino(1982, m);
  })
);

var nino1997 = ee.FeatureCollection(
  months.map(function(m){
    return getMonthlyNino(1997, m);
  })
);

var nino2015 = ee.FeatureCollection(
  months.map(function(m){
    return getMonthlyNino(2015, m);
  })
);


var months2026 = ee.List.sequence(1,6);

var nino2026 = ee.FeatureCollection(
  months2026.map(function(m){
    return getMonthlyNino(2026, m);
  })
);




print(nino1982);
print(nino1997);
print(nino2015);
print(nino2026);


var chart2015 = ui.Chart.feature.byFeature(
  nino2015,
  'month',
  'nino'
)
.setChartType('LineChart')
.setOptions({
  title: '2015 Niño 3.4 Index',
  hAxis: {title: 'Month'},
  vAxis: {title: 'Niño 3.4 (°C)'},
  lineWidth: 3,
  pointSize: 5
});


var chart2016 = ui.Chart.feature.byFeature(
  nino2026,
  'month',
  'nino'
)
.setChartType('LineChart')
.setOptions({
  title: '2026 Niño 3.4 Index',
  hAxis: {title: 'Month'},
  vAxis: {title: 'Niño 3.4 (°C)'},
  lineWidth: 3,
  pointSize: 5
});
print(chart2015);
print(chart2016);

var comparison = ee.FeatureCollection(
  months.map(function(m){

    var v1982 = ee.Number(
      nino1982
      .filter(ee.Filter.eq('month', m))
      .first()
      .get('nino')
    );

    var v1997 = ee.Number(
      nino1997
      .filter(ee.Filter.eq('month', m))
      .first()
      .get('nino')
    );

    var v2015 = ee.Number(
      nino2015
      .filter(ee.Filter.eq('month', m))
      .first()
      .get('nino')
    );

    return ee.Feature(null,{
      month: m,
      y1982: v1982,
      y1997: v1997,
      y2015: v2015
    });

  })
);

print(comparison);

var chart = ui.Chart.feature.byFeature(
  comparison,
  'month',
  ['y1982','y1997','y2015']
)
.setChartType('LineChart')
.setOptions({
  title: 'Historical El Niño Comparison',
  hAxis: {title:'Month'},
  vAxis: {title:'Niño 3.4 (°C)'},
  lineWidth: 3,
  pointSize: 5
});

print(chart);


print(
  '1982 Peak',
  nino1982.sort('nino', false).first()
);

print(
  '1997 Peak',
  nino1997.sort('nino', false).first()
);

print(
  '2015 Peak',
  nino2015.sort('nino', false).first()
);



print(
  '1982 June',
  getMonthlyNino(1982,6)
);

print(
  '1997 June',
  getMonthlyNino(1997,6)
);

print(
  '2015 June',
  getMonthlyNino(2015,6)
);


var strong2015 = nino2015.filter(
  ee.Filter.gt('nino', 1.5)
);

print(
  '2015 Strong Months',
  strong2015.size()
);

print(strong2015);


function countMonthsAbove(fc, threshold, label) {

  var filtered = fc.filter(
    ee.Filter.gt('nino', threshold)
  );

  print(
    label + ' Months > ' + threshold,
    filtered.size()
  );

  return filtered.size();
}

countMonthsAbove(nino1982, 1.5, '1982');

countMonthsAbove(nino1997, 1.5, '1997');

countMonthsAbove(nino2015, 1.5, '2015');



countMonthsAbove(nino2015, 1.5, '2026');



countMonthsAbove(nino1982, 2.0, '1982');

countMonthsAbove(nino1997, 2.0, '1997');

countMonthsAbove(nino2015, 2.0, '2015');

countMonthsAbove(nino2015, 2.0, '2026');


var ensoCatalog = ee.FeatureCollection([

  ee.Feature(null,{
    year:1982,
    peakMonth:12,
    peakValue:2.32,
    onsetRate:0.79,
    strongMonths:3,
    extremeMonths:1
  }),

  ee.Feature(null,{
    year:1997,
    peakMonth:11,
    peakValue:2.35,
    onsetRate:1.67,
    strongMonths:5,
    extremeMonths:3
  }),

  ee.Feature(null,{
    year:2015,
    peakMonth:11,
    peakValue:2.97,
    onsetRate:0.76,
    strongMonths:5,
    extremeMonths:3
  })

]);

print(ensoCatalog);


function buildEventSummary(fc, year){

  // Peak Feature
  var peak = fc
    .sort('nino', false)
    .first();

  // January value
  var jan = ee.Number(
    fc.filter(ee.Filter.eq('month',1))
      .first()
      .get('nino')
  );

  // June value
  var jun = ee.Number(
    fc.filter(ee.Filter.eq('month',6))
      .first()
      .get('nino')
  );

  // Onset Rate
  var onsetRate = jun.subtract(jan);

  // Strong Months
  var strongMonths = fc
    .filter(ee.Filter.gt('nino',1.5))
    .size();

  // Extreme Months
  var extremeMonths = fc
    .filter(ee.Filter.gt('nino',2.0))
    .size();
    
  var meanNino = fc.aggregate_mean('nino');  
  
var category = ee.String(
  ee.Algorithms.If(
    ee.Number(meanNino).gte(1.0),
    'Strong El Nino',
    ee.Algorithms.If(
      ee.Number(meanNino).gte(0.5),
      'El Nino',
      ee.Algorithms.If(
        ee.Number(meanNino).lte(-1.0),
        'Strong La Nina',
        ee.Algorithms.If(
          ee.Number(meanNino).lte(-0.5),
          'La Nina',
          'Neutral'
        )
      )
    )
  )
);

  return ee.Feature(null,{

    year: year,

    peakMonth: peak.get('month'),

    peakValue: peak.get('nino'),

    onsetRate: onsetRate,

    strongMonths: strongMonths,

    extremeMonths: extremeMonths ,
    
    meanNino : meanNino ,
    
    category : category

  });

}

var summary2015 =
  buildEventSummary(
    nino2015,
    2015
  );

print(summary2015);

var summary1982 =
  buildEventSummary(
    nino1982,
    1982
  );

var summary1997 =
  buildEventSummary(
    nino1997,
    1997
  );

var summary2015 =
  buildEventSummary(
    nino2015,
    2015
  );

var summary2026 =
  buildEventSummary(
    nino2026,
    2026
  );

var ensoCatalog = ee.FeatureCollection([

  summary1982,
  summary1997,
  summary2015,
  summary2026

]);

print(ensoCatalog);


print(
  nino2026.sort('month')
);

function buildYearSummary(year) {

  var monthly = ee.FeatureCollection(
    months.map(function(m) {
      return getMonthlyNino(year, m);
    })
  );

  return buildEventSummary(
    monthly,
    year
  );
}

// =====================================================
// BUILD FULL ENSO CATALOG
// =====================================================

var years = ee.List.sequence(1982, 2025);

var fullCatalog = ee.FeatureCollection(

  years.map(function(y) {

    return buildYearSummary(
      ee.Number(y)
    );

  })

);

// =====================================================
// OUTPUTS
// =====================================================

print('ENSO Catalog', fullCatalog);

print(
  'Number of Years',
  fullCatalog.size()
);

print(
  'Top 10 Strongest Events',
  fullCatalog
    .sort('peakValue', false)
    .limit(10)
);



fullCatalog.filter(
  ee.Filter.eq('category','Strong El Nino')
)

print(
  fullCatalog
    .sort('meanNino', false)
    .limit(10)
);

print(
  fullCatalog.aggregate_histogram('category')
);


// Export.table.toDrive({
//   collection: fullCatalog,
//   description: 'ENSO_Event_Catalog_1982_2025',
//   fileFormat: 'CSV'
// });

var india = ee.FeatureCollection(
  'FAO/GAUL/2015/level0'
)
.filter(
  ee.Filter.eq('ADM0_NAME', 'India')
);

Map.addLayer(
  india,
  {color:'yellow'},
  'India'
);

Map.centerObject(india,5);


var chirps = ee.ImageCollection(
  'UCSB-CHG/CHIRPS/DAILY'
);

print(chirps.first());

function getMonsoonRainfall(year){

  var start = ee.Date.fromYMD(year,6,1);

  var end = ee.Date.fromYMD(year,10,1);

  return chirps
    .filterDate(start,end)
    .sum()
    .clip(india);

}


var monsoon2015 =
  getMonsoonRainfall(2015);

Map.addLayer(
  monsoon2015,
  {
    min:200,
    max:2000,
    palette:[
      'yellow',
      'green',
      'blue'
    ]
  },
  'Monsoon 2015'
);


print(monsoon2015);


var stats = monsoon2015.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: india,
  scale: 5000,
  maxPixels: 1e13
});

print('Monsoon Stats', stats);


var strongYears = [
  1982,
  1997,
  2015,
  2023
];


function buildComposite(years){

  var images = ee.ImageCollection.fromImages(

    years.map(function(y){

      return getMonsoonRainfall(y);

    })

  );

  return images.mean();

}


var elNinoRainfall =
  buildComposite(strongYears);

Map.addLayer(
  elNinoRainfall,
  {
    min:50,
    max:4000,
    palette:[
      'yellow',
      'green',
      'blue'
    ]
  },
  'Strong El Nino Rainfall'
);

print(elNinoRainfall);



var neutralYears = [
  1984,
  1985,
  1990,
  2001,
  2013
];



var neutralRainfall =
  buildComposite(neutralYears);

Map.addLayer(
  neutralRainfall,
  {
    min:50,
    max:4000,
    palette:[
      'yellow',
      'green',
      'blue'
    ]
  },
  'Neutral Rainfall'
);


var rainfallDifference =
  elNinoRainfall.subtract(
    neutralRainfall
  );

Map.addLayer(
  rainfallDifference,
  {
    min:-500,
    max:500,
    palette:[
      'red',
      'white',
      'blue'
    ]
  },
  'El Nino Impact'
);



var indiaImpact = rainfallDifference.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: india,
  scale: 5000,
  maxPixels: 1e13
});

print(
  'Average El Nino Rainfall Change',
  indiaImpact
);


var neutralMean = neutralRainfall.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: india,
  scale: 5000,
  maxPixels: 1e13
});

print(
  'Neutral Rainfall Mean',
  neutralMean
);


var ndviCollection = ee.ImageCollection(
  'MODIS/061/MOD13Q1'
);

print(ndviCollection.first());


function getMonsoonNDVI(year){

  var start = ee.Date.fromYMD(year,6,1);

  var end = ee.Date.fromYMD(year,10,1);

  return ndviCollection
    .filterDate(start,end)
    .select('NDVI')
    .mean()
    .multiply(0.0001)
    .clip(india);

}



var ndvi2015 =
  getMonsoonNDVI(2015);

Map.addLayer(
  ndvi2015,
  {
    min:0,
    max:0.8,
    palette:[
      'brown',
      'yellow',
      'green',
      'darkgreen'
    ]
  },
  'NDVI 2015'
);

print(ndvi2015);


var ndviStats = ndvi2015.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: india,
  scale: 250,
  maxPixels: 1e13
});

print('NDVI Stats', ndviStats);


print(
  ndviCollection.aggregate_min('system:time_start')
);


var sstrongYears = [
  2015,
  2023
];

var elNinoNDVI = ee.ImageCollection.fromImages(
  sstrongYears.map(function(y){
    return getMonsoonNDVI(y);
  })
).mean();

print(elNinoNDVI, 'test')

var nneutralYears = [
  2001,
  2013,
  2014,
  2017,
  2018
];

var neutralNDVI = ee.ImageCollection.fromImages(
  nneutralYears.map(function(y){
    return getMonsoonNDVI(y);
  })
).mean();



print(neutralNDVI, 'test1')


var ndviDifference =
  elNinoNDVI.subtract(
    neutralNDVI
  );
  
  
  Map.addLayer(
  ndviDifference,
  {
    min:-0.1,
    max:0.1,
    palette:[
      'red',
      'white',
      'green'
    ]
  },
  'NDVI Impact'
);

print(
  ndviCollection
    .filterDate('1982-06-01','1982-10-01')
    .size()
);



var ndviImpact = ndviDifference.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: india,
  scale: 250,
  maxPixels: 1e13
});

print(
  'Average NDVI Change',
  ndviImpact
);


