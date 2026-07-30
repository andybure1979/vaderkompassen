
const PLACES = [["Malmö","Skåne","Södra Sverige",55.605,13.0038],["Ystad","Skåne","Södra Sverige",55.4295,13.8204],["Simrishamn","Skåne","Södra Sverige",55.5565,14.3504],["Kristianstad","Skåne","Södra Sverige",56.0294,14.1567],["Helsingborg","Skåne","Södra Sverige",56.0465,12.6945],["Båstad","Skåne","Södra Sverige",56.4269,12.8534],["Halmstad","Halland","Södra Sverige",56.6745,12.8578],["Varberg","Halland","Södra Sverige",57.1056,12.2508],["Falkenberg","Halland","Södra Sverige",56.9055,12.4912],["Göteborg","Västergötland","Södra Sverige",57.7089,11.9746],["Borås","Västergötland","Södra Sverige",57.721,12.9401],["Strömstad","Bohuslän","Södra Sverige",58.939,11.171],["Uddevalla","Bohuslän","Södra Sverige",58.3498,11.9384],["Smögen","Bohuslän","Södra Sverige",58.3559,11.2242],["Jönköping","Småland","Södra Sverige",57.7826,14.1618],["Växjö","Småland","Södra Sverige",56.8777,14.8091],["Kalmar","Småland","Södra Sverige",56.6634,16.3568],["Västervik","Småland","Södra Sverige",57.7584,16.6373],["Karlskrona","Blekinge","Södra Sverige",56.1612,15.5869],["Ronneby","Blekinge","Södra Sverige",56.209,15.276],["Borgholm","Öland","Södra Sverige",56.8793,16.6563],["Färjestaden","Öland","Södra Sverige",56.6499,16.4681],["Visby","Gotland","Södra Sverige",57.6348,18.2948],["Fårösund","Gotland","Södra Sverige",57.8635,19.0554],["Linköping","Östergötland","Mellansverige",58.4108,15.6214],["Norrköping","Östergötland","Mellansverige",58.5877,16.1924],["Motala","Östergötland","Mellansverige",58.5371,15.0365],["Nyköping","Södermanland","Mellansverige",58.753,17.0079],["Eskilstuna","Södermanland","Mellansverige",59.3712,16.5098],["Stockholm","Uppland","Mellansverige",59.3293,18.0686],["Uppsala","Uppland","Mellansverige",59.8586,17.6389],["Norrtälje","Uppland","Mellansverige",59.758,18.705],["Västerås","Västmanland","Mellansverige",59.6099,16.5448],["Sala","Västmanland","Mellansverige",59.9199,16.6066],["Örebro","Närke","Mellansverige",59.2753,15.2134],["Askersund","Närke","Mellansverige",58.8799,14.902],["Karlstad","Värmland","Mellansverige",59.3793,13.5036],["Arvika","Värmland","Mellansverige",59.6553,12.5852],["Falun","Dalarna","Mellansverige",60.6065,15.6355],["Mora","Dalarna","Mellansverige",61.0049,14.537],["Sälen","Dalarna","Mellansverige",61.156,13.266],["Borlänge","Dalarna","Mellansverige",60.4858,15.4371],["Gävle","Gästrikland","Mellansverige",60.6749,17.1413],["Sandviken","Gästrikland","Mellansverige",60.6167,16.7667],["Hudiksvall","Hälsingland","Norra Sverige",61.7274,17.1056],["Söderhamn","Hälsingland","Norra Sverige",61.3037,17.0592],["Sundsvall","Medelpad","Norra Sverige",62.3908,17.3069],["Härnösand","Ångermanland","Norra Sverige",62.6323,17.9379],["Örnsköldsvik","Ångermanland","Norra Sverige",63.2909,18.7153],["Östersund","Jämtland","Norra Sverige",63.1792,14.6357],["Åre","Jämtland","Norra Sverige",63.3983,13.0802],["Sveg","Härjedalen","Norra Sverige",62.0348,14.3658],["Funäsdalen","Härjedalen","Norra Sverige",62.5467,12.5426],["Vemdalen","Härjedalen","Norra Sverige",62.449,13.862],["Umeå","Västerbotten","Norra Sverige",63.8258,20.263],["Skellefteå","Västerbotten","Norra Sverige",64.7507,20.9528],["Luleå","Norrbotten","Norra Sverige",65.5848,22.1567],["Piteå","Norrbotten","Norra Sverige",65.3172,21.4794],["Haparanda","Norrbotten","Norra Sverige",65.8355,24.1368],["Kiruna","Lappland","Norra Sverige",67.8558,20.2253],["Gällivare","Lappland","Norra Sverige",67.1339,20.6528],["Abisko","Lappland","Norra Sverige",68.3495,18.8312],["Arvidsjaur","Lappland","Norra Sverige",65.5903,19.1668],["Hemavan","Lappland","Norra Sverige",65.819,15.086],["Skagen","Nordjylland","Jylland",57.7209,10.5839],["Aalborg","Nordjylland","Jylland",57.0488,9.9217],["Løkken","Nordjylland","Jylland",57.37,9.714],["Klitmøller","Nordjylland","Jylland",57.043,8.486],["Aarhus","Midtjylland","Jylland",56.1629,10.2039],["Esbjerg","Syddanmark","Jylland",55.4765,8.4594],["Hvide Sande","Midtjylland","Jylland",56.004,8.129],["Billund","Syddanmark","Jylland",55.7284,9.1124],["Odense","Fyn","Fyn",55.4038,10.4024],["København","Hovedstaden","Själland",55.6761,12.5683],["Roskilde","Själland","Själland",55.6415,12.0803],["Næstved","Själland","Själland",55.2299,11.7609],["Rønne/Bornholm","Bornholm","Själland",55.1009,14.7066],["Oslo","Oslo","Østlandet",59.9139,10.7522],["Drammen","Buskerud","Østlandet",59.7439,10.2045],["Lillehammer","Innlandet","Østlandet",61.1153,10.4662],["Hamar","Innlandet","Østlandet",60.7945,11.0679],["Fredrikstad","Østfold","Østlandet",59.2181,10.9298],["Geilo","Buskerud","Østlandet",60.5333,8.2076],["Trysil","Innlandet","Østlandet",61.3148,12.2637],["Hemsedal","Buskerud","Østlandet",60.8629,8.5534],["Kristiansand","Agder","Sørlandet",58.1467,7.9956],["Arendal","Agder","Sørlandet",58.4618,8.7724],["Grimstad","Agder","Sørlandet",58.3405,8.5934],["Mandal","Agder","Sørlandet",58.0274,7.4534],["Stavanger","Rogaland","Vestlandet",58.97,5.7331],["Haugesund","Rogaland","Vestlandet",59.4138,5.268],["Bergen","Vestland","Vestlandet",60.3913,5.3221],["Voss","Vestland","Vestlandet",60.6287,6.4147],["Flåm","Vestland","Vestlandet",60.8622,7.1132],["Ålesund","Møre og Romsdal","Vestlandet",62.4722,6.1495],["Molde","Møre og Romsdal","Vestlandet",62.7375,7.1607],["Kristiansund","Møre og Romsdal","Vestlandet",63.1103,7.7281],["Trondheim","Trøndelag","Trøndelag",63.4305,10.3951],["Røros","Trøndelag","Trøndelag",62.5748,11.3841],["Steinkjer","Trøndelag","Trøndelag",64.0149,11.4954],["Oppdal","Trøndelag","Trøndelag",62.5943,9.6912],["Bodø","Nordland","Nord-Norge",67.2804,14.4049],["Narvik","Nordland","Nord-Norge",68.4385,17.4272],["Svolvær","Nordland","Nord-Norge",68.2343,14.5682],["Tromsø","Troms","Nord-Norge",69.6492,18.9553],["Alta","Finnmark","Nord-Norge",69.9689,23.2716],["Hammerfest","Finnmark","Nord-Norge",70.6634,23.6821],["Kirkenes","Finnmark","Nord-Norge",69.7269,30.045],["Lund","Skåne","Södra Sverige",55.7047,13.191],["Trelleborg","Skåne","Södra Sverige",55.3751,13.1569],["Landskrona","Skåne","Södra Sverige",55.8708,12.8302],["Ängelholm","Skåne","Södra Sverige",56.2428,12.8622],["Höganäs","Skåne","Södra Sverige",56.1997,12.5579],["Kivik","Skåne","Södra Sverige",55.6859,14.223],["Åhus","Skåne","Södra Sverige",55.923,14.295],["Skanör","Skåne","Södra Sverige",55.4167,12.85],["Laholm","Halland","Södra Sverige",56.512,13.0437],["Kungsbacka","Halland","Södra Sverige",57.4872,12.0761],["Falköping","Västergötland","Södra Sverige",58.1735,13.5507],["Skövde","Västergötland","Södra Sverige",58.3912,13.8451],["Lidköping","Västergötland","Södra Sverige",58.5052,13.1577],["Mariestad","Västergötland","Södra Sverige",58.7097,13.8237],["Alingsås","Västergötland","Södra Sverige",57.93,12.5334],["Ulricehamn","Västergötland","Södra Sverige",57.7918,13.4148],["Trollhättan","Västergötland","Södra Sverige",58.2837,12.2886],["Vänersborg","Dalsland","Södra Sverige",58.3807,12.3234],["Åmål","Dalsland","Södra Sverige",59.052,12.7049],["Lysekil","Bohuslän","Södra Sverige",58.2743,11.4358],["Kungshamn","Bohuslän","Södra Sverige",58.363,11.2594],["Fjällbacka","Bohuslän","Södra Sverige",58.5997,11.2842],["Grebbestad","Bohuslän","Södra Sverige",58.7028,11.257],["Marstrand","Bohuslän","Södra Sverige",57.8869,11.5823],["Eksjö","Småland","Södra Sverige",57.6664,14.9721],["Nässjö","Småland","Södra Sverige",57.6531,14.6968],["Värnamo","Småland","Södra Sverige",57.186,14.04],["Ljungby","Småland","Södra Sverige",56.8332,13.9408],["Oskarshamn","Småland","Södra Sverige",57.2646,16.4484],["Vetlanda","Småland","Södra Sverige",57.4289,15.0776],["Vimmerby","Småland","Södra Sverige",57.6659,15.8552],["Nybro","Småland","Södra Sverige",56.7446,15.9071],["Karlshamn","Blekinge","Södra Sverige",56.1706,14.8619],["Sölvesborg","Blekinge","Södra Sverige",56.0521,14.5753],["Löttorp","Öland","Södra Sverige",57.1664,16.994],["Mörbylånga","Öland","Södra Sverige",56.5248,16.3788],["Hemse","Gotland","Södra Sverige",57.2378,18.3748],["Slite","Gotland","Södra Sverige",57.7045,18.8031],["Mjölby","Östergötland","Mellansverige",58.3259,15.1237],["Vadstena","Östergötland","Mellansverige",58.4484,14.8895],["Söderköping","Östergötland","Mellansverige",58.4808,16.3222],["Finspång","Östergötland","Mellansverige",58.7058,15.7674],["Katrineholm","Södermanland","Mellansverige",58.9959,16.2072],["Strängnäs","Södermanland","Mellansverige",59.3775,17.0312],["Mariefred","Södermanland","Mellansverige",59.2593,17.223],["Trosa","Södermanland","Mellansverige",58.8962,17.5481],["Södertälje","Södermanland","Mellansverige",59.1955,17.6253],["Enköping","Uppland","Mellansverige",59.6361,17.0777],["Sigtuna","Uppland","Mellansverige",59.6173,17.7236],["Östhammar","Uppland","Mellansverige",60.2597,18.3741],["Vaxholm","Uppland","Mellansverige",59.4022,18.3532],["Nynäshamn","Södermanland","Mellansverige",58.9034,17.9479],["Köping","Västmanland","Mellansverige",59.514,15.9926],["Arboga","Västmanland","Mellansverige",59.3939,15.8388],["Fagersta","Västmanland","Mellansverige",60.0042,15.7932],["Lindesberg","Västmanland","Mellansverige",59.592,15.2304],["Hallsberg","Närke","Mellansverige",59.0657,15.1117],["Nora","Västmanland","Mellansverige",59.5193,15.0398],["Kristinehamn","Värmland","Mellansverige",59.3098,14.1081],["Sunne","Värmland","Mellansverige",59.8376,13.143],["Torsby","Värmland","Mellansverige",60.1353,13.0082],["Filipstad","Värmland","Mellansverige",59.7124,14.1683],["Leksand","Dalarna","Mellansverige",60.7303,14.9998],["Rättvik","Dalarna","Mellansverige",60.8863,15.1179],["Malung","Dalarna","Mellansverige",60.6833,13.7154],["Avesta","Dalarna","Mellansverige",60.1455,16.1679],["Ludvika","Dalarna","Mellansverige",60.1496,15.1878],["Hedemora","Dalarna","Mellansverige",60.2797,15.9886],["Orsa","Dalarna","Mellansverige",61.1205,14.6154],["Älvdalen","Dalarna","Mellansverige",61.2277,14.039],["Tierp","Uppland","Mellansverige",60.342,17.5181],["Öregrund","Uppland","Mellansverige",60.3392,18.4405],["Ljusdal","Hälsingland","Norra Sverige",61.8272,16.0913],["Bollnäs","Hälsingland","Norra Sverige",61.3482,16.3946],["Järvsö","Hälsingland","Norra Sverige",61.7155,16.1702],["Timrå","Medelpad","Norra Sverige",62.487,17.3257],["Ånge","Medelpad","Norra Sverige",62.5246,15.659],["Sollefteå","Ångermanland","Norra Sverige",63.1668,17.2684],["Kramfors","Ångermanland","Norra Sverige",62.9316,17.7765],["Höga Kusten","Ångermanland","Norra Sverige",63.025,18.35],["Krokom","Jämtland","Norra Sverige",63.326,14.4488],["Strömsund","Jämtland","Norra Sverige",63.8521,15.5558],["Storlien","Jämtland","Norra Sverige",63.3167,12.1],["Bräcke","Jämtland","Norra Sverige",62.7509,15.4174],["Hede","Härjedalen","Norra Sverige",62.417,13.512],["Lofsdalen","Härjedalen","Norra Sverige",62.1137,13.2693],["Vilhelmina","Lappland","Norra Sverige",64.6242,16.6559],["Storuman","Lappland","Norra Sverige",65.0959,17.1173],["Lycksele","Lappland","Norra Sverige",64.5958,18.6764],["Dorotea","Lappland","Norra Sverige",64.2619,16.4135],["Norsjö","Västerbotten","Norra Sverige",64.9121,19.4815],["Robertsfors","Västerbotten","Norra Sverige",64.1932,20.8481],["Vindeln","Västerbotten","Norra Sverige",64.2018,19.7195],["Holmsund","Västerbotten","Norra Sverige",63.7063,20.364],["Kalix","Norrbotten","Norra Sverige",65.8557,23.1432],["Boden","Norrbotten","Norra Sverige",65.8251,21.6887],["Älvsbyn","Norrbotten","Norra Sverige",65.6762,21.0016],["Jokkmokk","Lappland","Norra Sverige",66.606,19.8234],["Pajala","Norrbotten","Norra Sverige",67.2128,23.3661],["Överkalix","Norrbotten","Norra Sverige",66.3275,22.8441],["Karesuando","Lappland","Norra Sverige",68.4417,22.4786],["Riksgränsen","Lappland","Norra Sverige",68.4264,18.1255],["Björkliden","Lappland","Norra Sverige",68.406,18.686],["Tärnaby","Lappland","Norra Sverige",65.7106,15.2575],["Frederikshavn","Nordjylland","Jylland",57.4407,10.5366],["Hirtshals","Nordjylland","Jylland",57.5881,9.9592],["Hanstholm","Nordjylland","Jylland",57.1167,8.6167],["Thisted","Nordjylland","Jylland",56.9552,8.6949],["Randers","Midtjylland","Jylland",56.4607,10.0364],["Silkeborg","Midtjylland","Jylland",56.1697,9.5451],["Viborg","Midtjylland","Jylland",56.4532,9.402],["Herning","Midtjylland","Jylland",56.1362,8.9766],["Horsens","Midtjylland","Jylland",55.8607,9.8503],["Vejle","Syddanmark","Jylland",55.7113,9.5364],["Kolding","Syddanmark","Jylland",55.4904,9.4722],["Sønderborg","Syddanmark","Jylland",54.9093,9.7922],["Aabenraa","Syddanmark","Jylland",55.0443,9.4174],["Ribe","Syddanmark","Jylland",55.3288,8.7623],["Blåvand","Syddanmark","Jylland",55.5572,8.1275],["Ringkøbing","Midtjylland","Jylland",56.0901,8.244],["Svendborg","Fyn","Fyn",55.0598,10.6068],["Nyborg","Fyn","Fyn",55.3127,10.7896],["Faaborg","Fyn","Fyn",55.0951,10.2423],["Kerteminde","Fyn","Fyn",55.449,10.6577],["Middelfart","Fyn","Fyn",55.5059,9.7305],["Assens","Fyn","Fyn",55.2702,9.9008],["Helsingør","Hovedstaden","Själland",56.0361,12.6136],["Hillerød","Hovedstaden","Själland",55.9279,12.3008],["Køge","Själland","Själland",55.458,12.1821],["Slagelse","Själland","Själland",55.4028,11.3546],["Holbæk","Själland","Själland",55.7167,11.7167],["Kalundborg","Själland","Själland",55.6795,11.0886],["Vordingborg","Själland","Själland",55.008,11.9106],["Møn","Själland","Själland",54.9833,12.3],["Gilleleje","Hovedstaden","Själland",56.1219,12.3106],["Hundested","Hovedstaden","Själland",55.9678,11.85],["Moss","Østfold","Østlandet",59.434,10.6577],["Halden","Østfold","Østlandet",59.1248,11.3875],["Sarpsborg","Østfold","Østlandet",59.2839,11.1096],["Kongsberg","Buskerud","Østlandet",59.6686,9.6502],["Hønefoss","Buskerud","Østlandet",60.168,10.2565],["Gol","Buskerud","Østlandet",60.7014,8.9457],["Fagernes","Innlandet","Østlandet",60.9858,9.2324],["Gjøvik","Innlandet","Østlandet",60.7957,10.6916],["Elverum","Innlandet","Østlandet",60.8819,11.5623],["Kongsvinger","Innlandet","Østlandet",60.1905,12.0038],["Otta","Innlandet","Østlandet",61.7712,9.5356],["Beitostølen","Innlandet","Østlandet",61.2475,8.9065],["Lillestrøm","Akershus","Østlandet",59.955,11.0492],["Tønsberg","Vestfold","Østlandet",59.2675,10.4076],["Sandefjord","Vestfold","Østlandet",59.1312,10.2166],["Larvik","Vestfold","Østlandet",59.0533,10.0352],["Skien","Telemark","Østlandet",59.2096,9.609],["Porsgrunn","Telemark","Østlandet",59.1405,9.6561],["Rjukan","Telemark","Østlandet",59.8789,8.5941],["Hovden","Agder","Sørlandet",59.5608,7.3568],["Flekkefjord","Agder","Sørlandet",58.297,6.6607],["Lillesand","Agder","Sørlandet",58.2488,8.3778],["Farsund","Agder","Sørlandet",58.0948,6.8047],["Lindesnes","Agder","Sørlandet",57.982,7.046],["Egersund","Rogaland","Vestlandet",58.4513,5.9997],["Sandnes","Rogaland","Vestlandet",58.8524,5.7352],["Jæren","Rogaland","Vestlandet",58.7,5.55],["Odda","Vestland","Vestlandet",60.0691,6.5457],["Hardanger","Vestland","Vestlandet",60.35,6.4],["Sogndal","Vestland","Vestlandet",61.2297,7.1006],["Førde","Vestland","Vestlandet",61.4522,5.8572],["Nordfjordeid","Vestland","Vestlandet",61.9063,5.9915],["Geiranger","Møre og Romsdal","Vestlandet",62.1015,7.2059],["Volda","Møre og Romsdal","Vestlandet",62.1468,6.0718],["Andalsnes","Møre og Romsdal","Vestlandet",62.5675,7.6871],["Levanger","Trøndelag","Trøndelag",63.7464,11.2996],["Stjørdal","Trøndelag","Trøndelag",63.468,10.9174],["Namsos","Trøndelag","Trøndelag",64.4662,11.4957],["Rørvik","Trøndelag","Trøndelag",64.861,11.2397],["Meråker","Trøndelag","Trøndelag",63.4147,11.7427],["Mo i Rana","Nordland","Nord-Norge",66.3128,14.1428],["Mosjøen","Nordland","Nord-Norge",65.835,13.1908],["Sandnessjøen","Nordland","Nord-Norge",66.0217,12.6316],["Brønnøysund","Nordland","Nord-Norge",65.4749,12.2128],["Leknes","Nordland","Nord-Norge",68.148,13.6115],["Andenes","Nordland","Nord-Norge",69.3143,16.1194],["Harstad","Troms","Nord-Norge",68.7986,16.5415],["Finnsnes","Troms","Nord-Norge",69.2296,17.9811],["Senja","Troms","Nord-Norge",69.3,17.5],["Lyngen","Troms","Nord-Norge",69.5761,20.2189],["Longyearbyen","Svalbard","Nord-Norge",78.2232,15.6469],["Ny-Ålesund","Svalbard","Nord-Norge",78.9236,11.9287],["Honningsvåg","Finnmark","Nord-Norge",70.9821,25.9704],["Vadsø","Finnmark","Nord-Norge",70.0744,29.7487],["Vardø","Finnmark","Nord-Norge",70.3705,31.1107],["Karasjok","Finnmark","Nord-Norge",69.4722,25.5112],["Vellinge","Skåne","Södra Sverige",55.47,13.02],["Staffanstorp","Skåne","Södra Sverige",55.64,13.21],["Lomma","Skåne","Södra Sverige",55.67,13.07],["Bjärred","Skåne","Södra Sverige",55.72,13.02],["Kävlinge","Skåne","Södra Sverige",55.79,13.11],["Eslöv","Skåne","Södra Sverige",55.84,13.3],["Höör","Skåne","Södra Sverige",55.93,13.54],["Hörby","Skåne","Södra Sverige",55.85,13.66],["Sjöbo","Skåne","Södra Sverige",55.63,13.71],["Tomelilla","Skåne","Södra Sverige",55.54,13.95],["Skurup","Skåne","Södra Sverige",55.48,13.5],["Svedala","Skåne","Södra Sverige",55.51,13.23],["Bromölla","Skåne","Södra Sverige",56.08,14.47],["Osby","Skåne","Södra Sverige",56.38,13.99],["Örkelljunga","Skåne","Södra Sverige",56.28,13.28],["Perstorp","Skåne","Södra Sverige",56.14,13.39],["Klippan","Skåne","Södra Sverige",56.14,13.13],["Åstorp","Skåne","Södra Sverige",56.13,12.94],["Bjuv","Skåne","Södra Sverige",56.08,12.92],["Hässleholm","Skåne","Södra Sverige",56.16,13.77],["Österlen","Skåne","Södra Sverige",55.6,14.05],["Mellbystrand","Halland","Södra Sverige",56.5,12.94],["Haverdal","Halland","Södra Sverige",56.72,12.67],["Oskarström","Halland","Södra Sverige",56.8,12.97],["Ullared","Halland","Södra Sverige",57.14,12.72],["Tvååker","Halland","Södra Sverige",57.04,12.4],["Fjärås","Halland","Södra Sverige",57.46,12.18],["Mölndal","Västergötland","Södra Sverige",57.66,12.01],["Partille","Västergötland","Södra Sverige",57.74,12.11],["Lerum","Västergötland","Södra Sverige",57.77,12.27],["Kungälv","Bohuslän","Södra Sverige",57.89,11.97],["Stenungsund","Bohuslän","Södra Sverige",58.07,11.82],["Tjörn","Bohuslän","Södra Sverige",58.0,11.62],["Orust","Bohuslän","Södra Sverige",58.18,11.64],["Munkedal","Bohuslän","Södra Sverige",58.47,11.67],["Tanumshede","Bohuslän","Södra Sverige",58.72,11.33],["Dingle","Bohuslän","Södra Sverige",58.53,11.58],["Färgelanda","Dalsland","Södra Sverige",58.57,11.99],["Mellerud","Dalsland","Södra Sverige",58.7,12.45],["Bengtsfors","Dalsland","Södra Sverige",59.03,12.23],["Ed","Dalsland","Södra Sverige",58.91,11.93],["Tranemo","Västergötland","Södra Sverige",57.48,13.35],["Svenljunga","Västergötland","Södra Sverige",57.5,13.11],["Mark","Västergötland","Södra Sverige",57.5,12.7],["Herrljunga","Västergötland","Södra Sverige",58.08,13.03],["Vara","Västergötland","Södra Sverige",58.26,12.95],["Götene","Västergötland","Södra Sverige",58.53,13.49],["Tibro","Västergötland","Södra Sverige",58.42,14.16],["Hjo","Västergötland","Södra Sverige",58.3,14.29],["Tidaholm","Västergötland","Södra Sverige",58.18,13.96],["Karlsborg","Västergötland","Södra Sverige",58.54,14.5],["Töreboda","Västergötland","Södra Sverige",58.71,14.13],["Gullspång","Västergötland","Södra Sverige",58.99,14.1],["Grästorp","Västergötland","Södra Sverige",58.33,12.68],["Essunga","Västergötland","Södra Sverige",58.18,12.78],["Gislaved","Småland","Södra Sverige",57.3,13.54],["Gnosjö","Småland","Södra Sverige",57.36,13.74],["Anderstorp","Småland","Södra Sverige",57.28,13.63],["Vaggeryd","Småland","Södra Sverige",57.5,14.15],["Sävsjö","Småland","Södra Sverige",57.4,14.66],["Aneby","Småland","Södra Sverige",57.84,14.81],["Tranås","Småland","Södra Sverige",58.04,14.98],["Hultsfred","Småland","Södra Sverige",57.49,15.84],["Målilla","Småland","Södra Sverige",57.39,15.81],["Virserum","Småland","Södra Sverige",57.32,15.58],["Emmaboda","Småland","Södra Sverige",56.63,15.54],["Torsås","Småland","Södra Sverige",56.41,16.0],["Högsby","Småland","Södra Sverige",57.17,16.03],["Mönsterås","Småland","Södra Sverige",57.04,16.44],["Gamleby","Småland","Södra Sverige",57.89,16.41],["Loftahammar","Småland","Södra Sverige",57.9,16.7],["Olofström","Blekinge","Södra Sverige",56.28,14.53],["Jämjö","Blekinge","Södra Sverige",56.19,15.84],["Rödeby","Blekinge","Södra Sverige",56.26,15.62],["Kallinge","Blekinge","Södra Sverige",56.24,15.29],["Byxelkrok","Öland","Södra Sverige",57.32,17.01],["Köpingsvik","Öland","Södra Sverige",56.88,16.72],["Degerhamn","Öland","Södra Sverige",56.36,16.41],["Fårö","Gotland","Södra Sverige",57.95,19.13],["Klintehamn","Gotland","Södra Sverige",57.39,18.2],["Ljugarn","Gotland","Södra Sverige",57.33,18.71],["Burgsvik","Gotland","Södra Sverige",57.03,18.28],["Boxholm","Östergötland","Mellansverige",58.2,15.05],["Kisa","Östergötland","Mellansverige",57.99,15.63],["Åtvidaberg","Östergötland","Mellansverige",58.2,16.0],["Valdemarsvik","Östergötland","Mellansverige",58.2,16.6],["Ödeshög","Östergötland","Mellansverige",58.23,14.65],["Borensberg","Östergötland","Mellansverige",58.56,15.28],["Flen","Södermanland","Mellansverige",59.06,16.59],["Vingåker","Södermanland","Mellansverige",59.04,15.87],["Gnesta","Södermanland","Mellansverige",59.05,17.31],["Oxelösund","Södermanland","Mellansverige",58.67,17.1],["Järna","Södermanland","Mellansverige",59.09,17.57],["Bålsta","Uppland","Mellansverige",59.57,17.53],["Knivsta","Uppland","Mellansverige",59.73,17.79],["Märsta","Uppland","Mellansverige",59.62,17.85],["Hallstavik","Uppland","Mellansverige",60.05,18.6],["Rimbo","Uppland","Mellansverige",59.74,18.37],["Åkersberga","Uppland","Mellansverige",59.48,18.3],["Täby","Uppland","Mellansverige",59.44,18.07],["Sollentuna","Uppland","Mellansverige",59.43,17.95],["Nacka","Södermanland","Mellansverige",59.31,18.16],["Gustavsberg","Uppland","Mellansverige",59.33,18.39],["Djurö","Uppland","Mellansverige",59.31,18.69],["Sandhamn","Uppland","Mellansverige",59.29,18.92],["Surahammar","Västmanland","Mellansverige",59.71,16.22],["Hallstahammar","Västmanland","Mellansverige",59.61,16.23],["Skinnskatteberg","Västmanland","Mellansverige",59.83,15.69],["Norberg","Västmanland","Mellansverige",60.07,15.92],["Kungsör","Västmanland","Mellansverige",59.42,16.1],["Kumla","Närke","Mellansverige",59.13,15.14],["Laxå","Närke","Mellansverige",58.99,14.62],["Degerfors","Värmland","Mellansverige",59.24,14.43],["Hällefors","Västmanland","Mellansverige",59.78,14.52],["Kopparberg","Västmanland","Mellansverige",59.88,14.99],["Kil","Värmland","Mellansverige",59.5,13.31],["Forshaga","Värmland","Mellansverige",59.53,13.48],["Grums","Värmland","Mellansverige",59.35,13.11],["Säffle","Värmland","Mellansverige",59.13,12.93],["Hagfors","Värmland","Mellansverige",60.03,13.67],["Munkfors","Värmland","Mellansverige",59.84,13.54],["Charlottenberg","Värmland","Mellansverige",59.88,12.3],["Storfors","Värmland","Mellansverige",59.53,14.27],["Insjön","Dalarna","Mellansverige",60.68,15.09],["Gagnef","Dalarna","Mellansverige",60.6,15.08],["Smedjebacken","Dalarna","Mellansverige",60.14,15.41],["Vansbro","Dalarna","Mellansverige",60.51,14.22],["Mockfjärd","Dalarna","Mellansverige",60.5,14.97],["Idre","Dalarna","Mellansverige",61.86,12.72],["Grövelsjön","Dalarna","Mellansverige",62.1,12.31],["Hofors","Gästrikland","Mellansverige",60.55,16.29],["Ockelbo","Gästrikland","Mellansverige",60.89,16.72],["Skutskär","Uppland","Mellansverige",60.63,17.41],["Edsbyn","Hälsingland","Norra Sverige",61.38,15.82],["Alfta","Hälsingland","Norra Sverige",61.35,16.07],["Delsbo","Hälsingland","Norra Sverige",61.8,16.56],["Iggesund","Hälsingland","Norra Sverige",61.64,17.07],["Gnarp","Hälsingland","Norra Sverige",62.05,17.24],["Matfors","Medelpad","Norra Sverige",62.35,17.03],["Kvissleby","Medelpad","Norra Sverige",62.3,17.38],["Fränsta","Medelpad","Norra Sverige",62.5,16.17],["Bollstabruk","Ångermanland","Norra Sverige",62.99,17.67],["Ramsele","Ångermanland","Norra Sverige",63.54,16.46],["Junsele","Ångermanland","Norra Sverige",63.69,16.88],["Bjästa","Ångermanland","Norra Sverige",63.2,18.5],["Ullånger","Ångermanland","Norra Sverige",63.0,18.18],["Duved","Jämtland","Norra Sverige",63.39,12.92],["Järpen","Jämtland","Norra Sverige",63.35,13.46],["Kall","Jämtland","Norra Sverige",63.47,13.24],["Hammerdal","Jämtland","Norra Sverige",63.58,15.36],["Gäddede","Jämtland","Norra Sverige",64.5,14.14],["Svenstavik","Jämtland","Norra Sverige",62.77,14.43],["Klövsjö","Jämtland","Norra Sverige",62.53,14.2],["Ramundberget","Härjedalen","Norra Sverige",62.7,12.38],["Tänndalen","Härjedalen","Norra Sverige",62.55,12.33],["Bruksvallarna","Härjedalen","Norra Sverige",62.64,12.45],["Nordmaling","Ångermanland","Norra Sverige",63.57,19.5],["Vännäs","Västerbotten","Norra Sverige",63.91,19.75],["Bjurholm","Ångermanland","Norra Sverige",63.93,19.21],["Åsele","Lappland","Norra Sverige",64.16,17.35],["Sorsele","Lappland","Norra Sverige",65.53,17.54],["Malå","Lappland","Norra Sverige",65.19,18.75],["Arjeplog","Lappland","Norra Sverige",66.05,17.89],["Ammarnäs","Lappland","Norra Sverige",65.96,16.2],["Kittelfjäll","Lappland","Norra Sverige",65.26,15.49],["Borgafjäll","Lappland","Norra Sverige",64.84,15.08],["Burträsk","Västerbotten","Norra Sverige",64.52,20.65],["Byske","Västerbotten","Norra Sverige",64.95,21.21],["Skelleftehamn","Västerbotten","Norra Sverige",64.69,21.24],["Sävar","Västerbotten","Norra Sverige",63.9,20.55],["Hörnefors","Västerbotten","Norra Sverige",63.62,19.91],["Råneå","Norrbotten","Norra Sverige",65.85,22.29],["Gammelstad","Norrbotten","Norra Sverige",65.64,22.01],["Harads","Norrbotten","Norra Sverige",66.09,20.95],["Vuollerim","Lappland","Norra Sverige",66.43,20.62],["Porjus","Lappland","Norra Sverige",66.96,19.82],["Övertorneå","Norrbotten","Norra Sverige",66.39,23.65],["Korpilombolo","Norrbotten","Norra Sverige",66.85,23.05],["Vittangi","Lappland","Norra Sverige",67.68,21.65],["Svappavaara","Lappland","Norra Sverige",67.65,21.06],["Jukkasjärvi","Lappland","Norra Sverige",67.85,20.61],["Katterjåkk","Lappland","Norra Sverige",68.42,18.16],["Sæby","Nordjylland","Jylland",57.33,10.53],["Brønderslev","Nordjylland","Jylland",57.27,9.94],["Hjørring","Nordjylland","Jylland",57.46,9.98],["Nørresundby","Nordjylland","Jylland",57.06,9.92],["Skive","Midtjylland","Jylland",56.57,9.03],["Holstebro","Midtjylland","Jylland",56.36,8.62],["Grenaa","Midtjylland","Jylland",56.42,10.88],["Ebeltoft","Midtjylland","Jylland",56.19,10.68],["Fredericia","Syddanmark","Jylland",55.57,9.75],["Haderslev","Syddanmark","Jylland",55.25,9.49],["Tønder","Syddanmark","Jylland",54.93,8.87],["Marstal","Fyn","Fyn",54.86,10.52],["Ærøskøbing","Fyn","Fyn",54.89,10.41],["Nakskov","Själland","Själland",54.83,11.14],["Maribo","Själland","Själland",54.77,11.5],["Nykøbing Falster","Själland","Själland",54.77,11.88],["Stege","Själland","Själland",54.99,12.28],["Rørvig","Själland","Själland",55.94,11.75]];

const REGIONS = ["Södra Sverige","Mellansverige","Norra Sverige","Jylland","Fyn","Själland","Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"];
const COUNTRY_REGIONS={
  Sverige:["Södra Sverige","Mellansverige","Norra Sverige"],
  Danmark:["Jylland","Fyn","Själland"],
  Norge:["Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"]
};
const REGION_AREAS=Object.fromEntries(REGIONS.map(region=>[
  region,[...new Set(PLACES.filter(p=>p[2]===region).map(p=>p[1]))].sort((a,b)=>a.localeCompare(b,"sv"))
]));
const ALL_AREAS=[...new Set(PLACES.map(p=>p[1]))];
const ACTIVITIES = {
  general:{label:"Sol och bad",icon:"☀️"},
  coast:{label:"Kustväder",icon:"🏖️"},
  surf:{label:"Surfväder",icon:"🏄"},
  boat:{label:"Båtväder",icon:"⛵"},
  fishing:{label:"Fiskeväder",icon:"🎣"},
  cycling:{label:"Cykelväder",icon:"🚴"},
  hiking:{label:"Vandringsväder",icon:"🥾"},
  ski:{label:"Skidväder",icon:"⛷️"}
};
const MODELS = {
  "SMHI":{type:"smhi",country:"SE"},
  "Yr / MET Norway":{type:"openMeteo",country:"NO",endpoint:"https://api.open-meteo.com/v1/metno"},
  "DMI":{type:"openMeteo",country:"DK",endpoint:"https://api.open-meteo.com/v1/dmi"},
  "ECMWF":{type:"openMeteo",model:"ecmwf_ifs025"},
  "ICON":{type:"openMeteo",model:"icon_seamless"},
  "GFS":{type:"openMeteo",model:"gfs_seamless"}
};
const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,wind_speed_10m_max,wind_direction_10m_dominant";

const MARINE_COORDS = {
  "Malmö":[55.58,12.93],"Ystad":[55.40,13.84],"Simrishamn":[55.55,14.39],"Helsingborg":[56.04,12.64],
  "Båstad":[56.43,12.78],"Halmstad":[56.65,12.78],"Varberg":[57.10,12.15],"Falkenberg":[56.88,12.39],
  "Göteborg":[57.67,11.83],"Strömstad":[58.94,11.08],"Uddevalla":[58.32,11.80],"Smögen":[58.35,11.16],
  "Kalmar":[56.66,16.43],"Västervik":[57.76,16.72],"Karlskrona":[56.13,15.63],"Ronneby":[56.16,15.33],
  "Borgholm":[56.88,16.72],"Färjestaden":[56.65,16.51],"Visby":[57.64,18.34],"Fårösund":[57.87,19.10],
  "Nyköping":[58.74,17.08],"Stockholm":[59.33,18.20],"Norrtälje":[59.75,18.82],"Gävle":[60.68,17.24],
  "Hudiksvall":[61.73,17.19],"Söderhamn":[61.30,17.16],"Sundsvall":[62.39,17.42],"Härnösand":[62.63,18.05],
  "Örnsköldsvik":[63.29,18.82],"Umeå":[63.77,20.40],"Skellefteå":[64.72,21.05],"Luleå":[65.56,22.28],
  "Piteå":[65.28,21.57],"Haparanda":[65.82,24.18],
  "Skagen":[57.74,10.66],"Aalborg":[57.08,10.10],"Løkken":[57.37,9.62],"Klitmøller":[57.04,8.40],
  "Aarhus":[56.16,10.33],"Esbjerg":[55.47,8.35],"Hvide Sande":[56.00,8.05],"Odense":[55.39,10.53],
  "København":[55.68,12.68],"Roskilde":[55.65,12.02],"Næstved":[55.20,11.67],"Rønne/Bornholm":[55.10,14.78],
  "Oslo":[59.88,10.73],"Fredrikstad":[59.17,10.92],"Kristiansand":[58.10,8.00],"Arendal":[58.42,8.82],
  "Stavanger":[58.97,5.63],"Haugesund":[59.40,5.20],"Bergen":[60.39,5.20],"Ålesund":[62.47,6.05],
  "Molde":[62.74,7.08],"Kristiansund":[63.11,7.62],"Trondheim":[63.45,10.30],"Bodø":[67.28,14.30],
  "Narvik":[68.43,17.30],"Svolvær":[68.23,14.45],"Tromsø":[69.65,18.82],"Hammerfest":[70.66,23.55]
};
const SKI_PLACES = new Set(["Sälen","Åre","Sveg","Funäsdalen","Vemdalen","Kiruna","Gällivare","Abisko","Arvidsjaur","Hemavan","Geilo","Trysil","Hemsedal","Voss","Røros","Oppdal","Narvik"]);

// Kategorispecifika ortprofiler. Vädret hämtas fortfarande för alla valda orter,
// men topplistan visar i första hand destinationer som faktiskt passar aktiviteten.
const BATH_PLACES = new Set([
  ...Object.keys(MARINE_COORDS),
  "Åhus","Skanör","Trelleborg","Landskrona","Ängelholm","Höganäs","Kivik","Laholm","Kungsbacka",
  "Lysekil","Kungshamn","Fjällbacka","Grebbestad","Marstrand","Karlshamn","Sölvesborg","Löttorp","Mörbylånga","Hemse","Slite",
  "Motala","Vadstena","Askersund","Karlstad","Kristinehamn","Lidköping","Mariestad","Vänersborg","Åmål",
  "Leksand","Rättvik","Mora","Trosa","Vaxholm","Nynäshamn","Östhammar","Sigtuna",
  "Grimstad","Mandal","Drammen","Hamar","Lillehammer","Flåm","Alta",
  "Blåvand","Ringkøbing"
]);
const SURF_PROFILES = {
  "Varberg":{spotName:"Apelviken",offshore:90},"Falkenberg":{spotName:"Olofsbo",offshore:90},"Halmstad":{spotName:"Ringenäs",offshore:90},
  "Båstad":{spotName:"Mellbystrand",offshore:90},"Höganäs":{spotName:"Viken",offshore:120},"Ystad":{spotName:"Kåseberga",offshore:330},
  "Skanör":{spotName:"Höllviken",offshore:90},"Klitmøller":{spotName:"Klitmøller",offshore:90},"Løkken":{spotName:"Løkken",offshore:90},
  "Hvide Sande":{spotName:"Hvide Sande",offshore:90},"Blåvand":{spotName:"Blåvand",offshore:90},"Skagen":{spotName:"Skagen",offshore:180},
  "Esbjerg":{spotName:"Fanø",offshore:90},"Stavanger":{spotName:"Jæren",offshore:90},"Haugesund":{spotName:"Karmøy",offshore:90},
  "Bergen":{spotName:"Øygarden",offshore:90},"Kristiansand":{spotName:"Lista",offshore:30},"Mandal":{spotName:"Lista",offshore:30},
  "Svolvær":{spotName:"Unstad",offshore:120},"Bodø":{spotName:"Mørkved",offshore:120}
};
const SURF_PLACES = new Set(Object.keys(SURF_PROFILES));
const BOAT_PLACES = new Set([
  ...Object.keys(MARINE_COORDS),
  "Motala","Vadstena","Askersund","Karlstad","Kristinehamn","Lidköping","Mariestad","Vänersborg","Åmål",
  "Leksand","Rättvik","Mora","Vaxholm","Nynäshamn","Trosa","Sigtuna","Flåm","Drammen","Hamar"
]);
const FISHING_PLACES = new Set([
  ...BOAT_PLACES,
  "Funäsdalen","Sveg","Vemdalen","Östersund","Åre","Hemavan","Arvidsjaur","Kiruna","Gällivare",
  "Geilo","Trysil","Hemsedal","Voss","Røros","Oppdal","Narvik","Alta","Kirkenes"
]);
const CYCLING_PLACES = new Set([
  "Malmö","Lund","Ystad","Simrishamn","Kivik","Båstad","Halmstad","Varberg","Falkenberg","Göteborg",
  "Borgholm","Färjestaden","Löttorp","Mörbylånga","Visby","Fårösund","Hemse","Slite",
  "Linköping","Motala","Vadstena","Nyköping","Trosa","Stockholm","Uppsala","Västerås","Örebro",
  "Karlstad","Mora","Leksand","Rättvik","København","Odense","Aarhus","Skagen","Rønne/Bornholm",
  "Oslo","Drammen","Kristiansand","Grimstad","Mandal","Trondheim"
]);
const HIKING_PLACES = new Set([
  "Sälen","Mora","Rättvik","Åre","Östersund","Sveg","Funäsdalen","Vemdalen","Kiruna","Gällivare","Abisko",
  "Arvidsjaur","Hemavan","Höga Kusten","Örnsköldsvik","Härnösand",
  "Geilo","Trysil","Hemsedal","Voss","Flåm","Røros","Oppdal","Narvik","Svolvær","Tromsø","Alta",
  "Bergen","Ålesund","Molde","Bodø","Lillehammer"
]);
const ACTIVITY_PLACE_SETS={
  general:null,coast:new Set(Object.keys(MARINE_COORDS)),surf:SURF_PLACES,boat:BOAT_PLACES,
  fishing:FISHING_PLACES,cycling:CYCLING_PLACES,hiking:HIKING_PLACES,ski:SKI_PLACES
};
function activityPlaces(list){
  const profile=ACTIVITY_PLACE_SETS[settings.activity];
  if(!profile)return list;
  const specialized=list.filter(x=>profile.has(x.place));
  return specialized.length?specialized:list;
}

const MARINE_DAILY = "wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_direction_dominant,swell_wave_period_max";
const MARINE_HOURLY = "sea_surface_temperature";
const SNOW_DAILY = "snowfall_sum";
const SNOW_HOURLY = "snow_depth,freezing_level_height";


const defaults={
  temp:22,rain:3,sun:2,wind:1.5,regions:[...REGIONS],areas:[...ALL_AREAS],activity:"general",
  sourceMode:"auto",sources:Object.keys(MODELS)
};
let settings={...defaults,...JSON.parse(localStorage.getItem("vk-settings")||"{}")};
if(!Array.isArray(settings.regions)){ settings.regions=[...REGIONS]; }
if(!Array.isArray(settings.areas))settings.areas=[...ALL_AREAS];
if(settings.regions.includes("Danmark")){ settings.regions=settings.regions.filter(x=>x!=="Danmark").concat(["Jylland","Fyn","Själland"]); }
settings.regions=[...new Set(settings.regions.filter(x=>REGIONS.includes(x)))];
if(!settings.regions.length)settings.regions=[...REGIONS];
settings.areas=[...new Set(settings.areas.filter(x=>ALL_AREAS.includes(x)))];
if(!settings.areas.length)settings.areas=[...ALL_AREAS];
if(!["auto","manual"].includes(settings.sourceMode))settings.sourceMode="auto";
if(!Array.isArray(settings.sources))settings.sources=Object.keys(MODELS);
settings.sources=[...new Set(settings.sources.filter(x=>Object.hasOwn(MODELS,x)))];
if(!settings.sources.length)settings.sources=Object.keys(MODELS);

let dailyResults={}, cloudRankings={}, activeDate=null, map=null, markerLayer=null;
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(100,n));
const mean=a=>{const b=a.filter(Number.isFinite);return b.length?b.reduce((x,y)=>x+y,0)/b.length:null};
const std=a=>{const b=a.filter(Number.isFinite);if(b.length<2)return 0;const m=mean(b);return Math.sqrt(b.reduce((s,x)=>s+(x-m)**2,0)/(b.length-1))};
const fmt=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):"–";
const validNumber=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);

function countryFor(item){
  if(COUNTRY_REGIONS.Danmark.includes(item.region)) return "DK";
  if(COUNTRY_REGIONS.Norge.includes(item.region)) return "NO";
  return "SE";
}
function sourceWeight(model,item){
  if(settings.sourceMode==="manual")return 1;
  const country=countryFor(item);
  if(country==="SE" && model==="SMHI") return 3.5;
  if(country==="DK" && model==="DMI") return 3.5;
  if(country==="NO" && model==="Yr / MET Norway") return 3.5;
  if(model==="ECMWF") return 1.25;
  return 1;
}
function weightedMean(rows,key){
  const valid=rows.filter(r=>Number.isFinite(r[key]));
  if(!valid.length)return null;
  const total=valid.reduce((sum,r)=>sum+sourceWeight(r.model,r),0);
  return valid.reduce((sum,r)=>sum+r[key]*sourceWeight(r.model,r),0)/total;
}
function activeModelEntries(){
  const names=settings.sourceMode==="auto"?Object.keys(MODELS):settings.sources;
  return names.filter(name=>Object.hasOwn(MODELS,name)).map(name=>[name,MODELS[name]]);
}
function dominantSource(rows,item){
  const available=[...new Set(rows.filter(r=>Number.isFinite(r.temp)).map(r=>r.model))];
  if(!available.length)return "–";
  return available.sort((a,b)=>sourceWeight(b,item)-sourceWeight(a,item))[0];
}
function sourceLabel(){
  const names=activeModelEntries().map(([name])=>name);
  return settings.sourceMode==="auto"
    ? `Automatiskt · ${names.length} källor`
    : `Eget val · ${names.join(", ")}`;
}


const bell=(value,target,width)=>clamp(100-Math.abs(value-target)*(100/width));
const normalizeAngle=value=>((value%360)+360)%360;
function angleDifference(a,b){
  if(!Number.isFinite(a)||!Number.isFinite(b))return 180;
  return Math.abs(((normalizeAngle(a)-normalizeAngle(b)+540)%360)-180);
}
function circularMean(values){
  const valid=values.filter(Number.isFinite);if(!valid.length)return null;
  const x=mean(valid.map(v=>Math.cos(v*Math.PI/180))),y=mean(valid.map(v=>Math.sin(v*Math.PI/180)));
  return normalizeAngle(Math.atan2(y,x)*180/Math.PI);
}
function bearing(fromLat,fromLon,toLat,toLon){
  const φ1=fromLat*Math.PI/180,φ2=toLat*Math.PI/180,λ=(toLon-fromLon)*Math.PI/180;
  return normalizeAngle(Math.atan2(Math.sin(λ)*Math.cos(φ2),Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ))*180/Math.PI);
}
function offshoreWindFromDirection(r){
  const profile=SURF_PROFILES[r.place];
  if(profile)return profile.offshore;
  const sea=MARINE_COORDS[r.place];
  return sea?bearing(sea[0],sea[1],r.lat,r.lon):null;
}
function placeLabel(r){return settings.activity==="surf"?(r.spotName||SURF_PROFILES[r.place]?.spotName||r.place):r.place;}
function compassDirection(deg){
  if(!Number.isFinite(deg))return "–";
  return ["N","NÖ","Ö","SÖ","S","SV","V","NV"][Math.round(normalizeAngle(deg)/45)%8];
}
function surfOffshoreScore(r){
  const target=offshoreWindFromDirection(r);
  if(!Number.isFinite(target)||!Number.isFinite(r.windDirection)||!Number.isFinite(r.wind))return 0;
  const alignment=clamp(100-angleDifference(r.windDirection,target)/90*100);
  const strength=clamp((r.wind-1)/11*100);
  return alignment*(.35+.65*strength/100);
}

function activityScore(r){
  const temp=r.temp??0, rain=r.rain??0, risk=r.risk??0, sun=r.sun??0, wind=r.wind??0, min=r.min??0;
  const dry=clamp(100-rain*18-risk*.45), sunny=clamp(sun/12*100);
  switch(settings.activity){
    case "general":{
      const pleasantWind=bell(wind,2.5,7);
      return .34*bell(temp,25,15)+.30*dry+.24*sunny+.12*pleasantWind;
    }
    case "coast":{
      const sea=Number.isFinite(r.seaTemp)?bell(r.seaTemp,20,10):45;
      const waves=Number.isFinite(r.waveHeight)?bell(r.waveHeight,.6,1.5):45;
      return .20*bell(temp,22,12)+.20*dry+.18*sunny+.14*bell(wind,5,6)+.18*sea+.10*waves;
    }
    case "surf":{
      // Högre vågor ger högre poäng (upp till 3,5 m). Frånlandsvind premieras både för riktning och styrka.
      const wave=Number.isFinite(r.waveHeight)?clamp((r.waveHeight-.25)/3.25*100):0;
      const offshore=surfOffshoreScore(r);
      const period=Number.isFinite(r.wavePeriod)?clamp((r.wavePeriod-4)/10*100):0;
      const swell=Number.isFinite(r.swellHeight)?clamp((r.swellHeight-.15)/2.85*100):0;
      return .38*wave+.25*offshore+.27*period+.10*swell;
    }
    case "boat":{
      const waves=Number.isFinite(r.waveHeight)?clamp(100-r.waveHeight*45):0;
      return .16*bell(temp,19,13)+.24*dry+.10*sunny+.30*bell(wind,4,5)+.20*waves;
    }
    case "fishing":{
      const waves=Number.isFinite(r.waveHeight)?bell(r.waveHeight,.5,1.5):50;
      return .18*bell(temp,16,14)+.25*dry+.10*sunny+.27*bell(wind,3.5,5)+.20*waves;
    }
    case "cycling": return .30*bell(temp,19,11)+.35*dry+.15*sunny+.20*bell(wind,2.5,5);
    case "hiking": return .30*bell(temp,17,12)+.35*dry+.15*sunny+.20*bell(wind,3,6);
    case "ski":{
      const depth=Number.isFinite(r.snowDepth)?clamp(r.snowDepth/80*100):0;
      const fresh=Number.isFinite(r.newSnow)?clamp(r.newSnow/15*100):0;
      const cold=bell(temp,-3,12);
      const windScore=bell(wind,3,7);
      const freeze=Number.isFinite(r.freezingLevel)?clamp(100-r.freezingLevel/18):50;
      return .32*depth+.25*fresh+.18*cold+.15*windScore+.10*freeze;
    }
    default:{
      const tempScore=bell(temp,settings.temp,14);
      const windScore=clamp(100-Math.max(0,wind-3)*10);
      return (tempScore+dry*settings.rain+windScore*settings.wind+sunny*settings.sun)/(1+settings.rain+settings.wind+settings.sun);
    }
  }
}
function activitySummary(score){
  if(score>=90)return "Perfekt idag";
  if(score>=80)return "Mycket bra idag";
  if(score>=65)return "Bra idag";
  if(score>=50)return "Okej idag";
  return "Välj hellre en annan plats";
}
function decisionReasons(r){
  const reasons=[];
  const add=(icon,label,value)=>reasons.push({icon,label,value});
  const a=settings.activity;
  if(a==="surf"){
    if(Number.isFinite(r.waveHeight))add("🌊","Vågor",`${fmt(r.waveHeight)} m`);
    if(Number.isFinite(r.wavePeriod))add("↔️","Period",`${fmt(r.wavePeriod,0)} s`);
    add("💨","Vind",`${fmt(r.wind)} m/s ${Number.isFinite(r.windDirection)?compassDirection(r.windDirection):""}`.trim());
  }else if(a==="ski"){
    if(Number.isFinite(r.snowDepth))add("❄️","Snö",`${fmt(r.snowDepth,0)} cm`);
    if(Number.isFinite(r.newSnow))add("🌨️","Nysnö",`${fmt(r.newSnow)} cm`);
    add("🌡️","Temperatur",`${fmt(r.temp,0)}°`);
  }else if(["coast","boat","fishing"].includes(a)){
    add("💨","Vind",`${fmt(r.wind)} m/s`);
    if(Number.isFinite(r.waveHeight))add("🌊","Vågor",`${fmt(r.waveHeight)} m`);
    add("☀️","Sol",`${fmt(r.sun)} h`);
  }else{
    add("☀️","Sol",`${fmt(r.sun)} h`);
    add("🌧️","Regn",`${fmt(r.rain)} mm`);
    add("🌡️","Temperatur",`${fmt(r.temp,0)}°`);
  }
  return reasons.slice(0,3);
}
function decisionSentence(r){
  const a=settings.activity;
  if(a==="surf")return `Bäst kombination av vågor, period och vind bland de valda platserna.`;
  if(a==="ski")return `Bäst kombination av snö, temperatur och prognossäkerhet.`;
  if(a==="coast")return `Bäst kustläge utifrån vind, vågor och väder.`;
  if(a==="boat")return `Bäst båtläge utifrån vind, vågor och nederbörd.`;
  if(a==="fishing")return `Bäst fiskeläge utifrån vind, nederbörd och temperatur.`;
  if(a==="cycling")return `Bäst cykelläge utifrån vind, regn och temperatur.`;
  if(a==="hiking")return `Bäst vandringsläge utifrån regn, vind och temperatur.`;
  return `Bäst helhetsläge bland de platser och områden du valt.`;
}
function renderActivities(){
  const box=$("activityChoices");box.innerHTML="";
  document.body.dataset.activity=settings.activity;
  Object.entries(ACTIVITIES).forEach(([key,a])=>{
    const b=document.createElement("button");
    b.type="button";b.className="activity-chip"+(settings.activity===key?" active":"");
    b.innerHTML=`<span>${a.icon}</span>${a.label}`;
    b.onclick=()=>{settings.activity=key;localStorage.setItem("vk-settings",JSON.stringify(settings));renderActivities();if(!restoreWeatherCache())load();};
    box.appendChild(b);
  });
  $("activeActivity").textContent=`${ACTIVITIES[settings.activity].icon} ${ACTIVITIES[settings.activity].label}`;
}
function renderRegionChoices(){
  const box=$("regionChoices");box.innerHTML="";
  REGIONS.forEach(region=>{
    const group=document.createElement("section");group.className="filter-region-group";
    const head=document.createElement("label");head.className="check region-check region-head";
    const ri=document.createElement("input");ri.type="checkbox";ri.value=region;ri.dataset.kind="region";
    ri.checked=settings.regions.includes(region);
    head.append(ri,document.createTextNode(" "+region));group.appendChild(head);
    const children=document.createElement("div");children.className="landscape-grid";
    REGION_AREAS[region].forEach(area=>{
      const l=document.createElement("label");l.className="check landscape-check";
      const i=document.createElement("input");i.type="checkbox";i.value=area;i.dataset.kind="area";i.dataset.region=region;
      i.checked=settings.areas.includes(area) && ri.checked;
      l.append(i,document.createTextNode(" "+area));children.appendChild(l);
    });
    ri.onchange=()=>children.querySelectorAll("input").forEach(i=>i.checked=ri.checked);
    group.appendChild(children);box.appendChild(group);
  });
}
function selectCountry(country){
  const target=new Set(COUNTRY_REGIONS[country]||[]);
  document.querySelectorAll('#regionChoices input[data-kind="region"]').forEach(i=>{
    i.checked=target.has(i.value);
    document.querySelectorAll(`#regionChoices input[data-kind="area"][data-region="${i.value}"]`).forEach(a=>a.checked=i.checked);
  });
}
function renderSourceChoices(){
  const box=$("sourceChoices");box.innerHTML="";
  Object.keys(MODELS).forEach(name=>{
    const l=document.createElement("label");l.className="check source-check";
    const i=document.createElement("input");i.type="checkbox";i.value=name;
    i.checked=settings.sources.includes(name);
    i.disabled=$("sourceMode").value==="auto";
    l.append(i,document.createTextNode(" "+name));box.appendChild(l);
  });
  $("sourceHint").textContent=$("sourceMode").value==="auto"
    ?"Alla källor används. Nationell källa prioriteras: SMHI i Sverige, Yr/MET Norway i Norge och DMI i Danmark."
    :"Endast markerade källor används och de väger lika.";
}

const BATCH_SIZE=80;
const MAX_BATCH_CONCURRENCY=1;
const POINT_SOURCE_CONCURRENCY=6;
const REQUEST_TIMEOUT_MS=12000;
const REQUEST_RETRIES=1;
const SOURCE_TIMEOUT_MS=22000;
const EXTRA_TIMEOUT_MS=16000;
const RESPONSE_CACHE_TTL_MS=10*60*1000;
const responseCache=new Map();
const chunks=(arr,size)=>Array.from({length:Math.ceil(arr.length/size)},(_,i)=>arr.slice(i*size,(i+1)*size));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function mapWithConcurrency(items,limit,worker){
  const results=new Array(items.length);let next=0;
  async function runner(){
    while(next<items.length){const i=next++;try{results[i]={status:"fulfilled",value:await worker(items[i],i)}}catch(reason){results[i]={status:"rejected",reason}}}
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},runner));
  return results;
}
const diagnostics={version:"13.9.0",mode:"checking",lastLoad:null,sources:[]};
function setDataMode(mode,detail=""){
  diagnostics.mode=mode;
  const badge=$("dataModeBadge");
  if(!badge)return;
  if(!badge)return;
  const states={
    cloud:{text:"☁️ Moln",title:"Prognosen hämtades från Väderkompassens molntjänst."},
    local:{text:"📱 Lokal reserv",title:"Molntjänsten kunde inte användas. Prognosen beräknades lokalt i enheten."},
    checking:{text:"Kontrollerar…",title:"Kontrollerar om molnprognosen är tillgänglig."},
    cachedCloud:{text:"☁️ Molncache",title:"Visar senast sparade molnprognos medan en ny kontroll görs."},
    cachedLocal:{text:"📱 Lokal cache",title:"Visar senast lokalt beräknade prognos medan en ny kontroll görs."}
  };
  const state=states[mode]||states.checking;
  badge.textContent=state.text;
  badge.className=`data-mode-badge ${mode}`;
  badge.title=detail?`${state.title} ${detail}`:state.title;
}
const WEATHER_CACHE_KEY="vk-weather-cache-v13.9.0";
const POINT_CACHE_KEY="vk-point-cache-v13.9.0";
const BACKGROUND_REFRESH_MS=30*60*1000;
let refreshTimer=null;
let loadInProgress=false;
function cacheSignature(){
  return JSON.stringify({regions:[...settings.regions].sort(),areas:[...settings.areas].sort(),activity:settings.activity});
}
function formatUpdatedAt(timestamp){
  return new Intl.DateTimeFormat("sv-SE",{dateStyle:"short",timeStyle:"short"}).format(new Date(timestamp));
}
function readWeatherCache(){
  try{
    const cache=JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)||"null");
    return cache&&cache.signature===cacheSignature()&&cache.dailyResults?cache:null;
  }catch{return null}
}
function saveWeatherCache(meta={}){
  try{localStorage.setItem(WEATHER_CACHE_KEY,JSON.stringify({signature:cacheSignature(),savedAt:Date.now(),dailyResults,activeDate,modelText:$("modelCount").textContent,modelTitle:$("modelCount").title,...meta}))}catch{}
}
function restoreWeatherCache(){
  const cache=readWeatherCache();
  if(!cache)return false;
  dailyResults=cache.dailyResults||{};
  activeDate=cache.activeDate||Object.keys(dailyResults).sort()[0]||null;
  if(!activeDate)return false;
  $("modelCount").textContent=cache.modelText||`Sparad prognos · uppdaterad ${formatUpdatedAt(cache.savedAt)}`;
  $("modelCount").title=cache.modelTitle||"";
  $("statusCard").classList.add("hidden");
  setDataMode(cache.cloud?"cachedCloud":"cachedLocal",`Sparad ${formatUpdatedAt(cache.savedAt)}.`);
  renderTabs();renderActivities();renderDay();
  // Lokal cache är bara en startvy. När molnläget är aktivt kontrolleras
  // Worker-API:t direkt i stället för att vänta upp till 30 minuter.
  if(cloudApiEnabled()){
    // Visa cache direkt, men kontrollera alltid molnet omedelbart. En sparad
    // molnprognos får inte skjuta upp hämtningen av en nyare snapshot.
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>load({background:true}),300);
  }else{
    scheduleBackgroundRefresh(cache.savedAt);
  }
  return true;
}
function scheduleBackgroundRefresh(lastSaved=Date.now()){
  clearTimeout(refreshTimer);
  const delay=Math.max(1000,BACKGROUND_REFRESH_MS-(Date.now()-lastSaved));
  refreshTimer=setTimeout(()=>load({background:true}),delay);
}


function pointCacheId(source,place){return `${source}|${place[0]}|${place[3]}|${place[4]}`}
function readPointCache(){try{return JSON.parse(localStorage.getItem(POINT_CACHE_KEY)||"{}")||{}}catch{return {}}}
function savePointCache(cache){try{localStorage.setItem(POINT_CACHE_KEY,JSON.stringify(cache))}catch{}}
async function fetchPlacesPersistently(source,places,worker){
  const cache=readPointCache();
  const results=await mapWithConcurrency(places,POINT_SOURCE_CONCURRENCY,async place=>{
    const id=pointCacheId(source,place);
    try{
      const rows=await worker(place);
      cache[id]={savedAt:Date.now(),rows};savePointCache(cache);
      return rows;
    }catch(error){
      const old=cache[id];
      if(old?.rows?.length)return old.rows;
      throw error;
    }
  });
  return {rows:results.filter(x=>x.status==="fulfilled").flatMap(x=>x.value),results};
}


const CLOUD_CONFIG=window.VK_CONFIG||{};
function cloudApiEnabled(){return Boolean(CLOUD_CONFIG.preferCloud&&String(CLOUD_CONFIG.apiBaseUrl||"").trim())}
async function fetchCloudSnapshot(places){
  if(!cloudApiEnabled())return null;
  const params=new URLSearchParams({
    regions:[...settings.regions].sort().join(","),
    areas:[...settings.areas].sort().join(","),
    activity:settings.activity
  });
  const base=String(CLOUD_CONFIG.apiBaseUrl).replace(/\/$/,"");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Number(CLOUD_CONFIG.apiTimeoutMs)||10000);
  try{
    const response=await fetch(`${base}/v1/forecast?${params}`,{headers:{Accept:"application/json"},signal:controller.signal,cache:"no-store"});
    if(response.status===404||response.status===204)return null;
    if(!response.ok)throw new Error(`Moln-API HTTP ${response.status}`);
    const payload=await response.json();
    if(!payload?.dailyResults||!Object.keys(payload.dailyResults).length)throw new Error("Moln-API saknar prognosdata");
    const allowed=new Set(places.map(p=>p[0]));
    const filtered={};
    for(const [day,rows] of Object.entries(payload.dailyResults)){
      filtered[day]=(Array.isArray(rows)?rows:[]).filter(row=>allowed.has(row.place));
      if(!filtered[day].length)delete filtered[day];
    }
    if(!Object.keys(filtered).length)return null;
    return {...payload,dailyResults:filtered};
  }finally{clearTimeout(timer)}
}
function applyCloudSnapshot(snapshot,places){
  const previouslySelectedDate=activeDate;
  dailyResults=snapshot.dailyResults;
  cloudRankings=snapshot.rankedResults||{};
  const availableDates=Object.keys(dailyResults).sort();
  activeDate=previouslySelectedDate&&dailyResults[previouslySelectedDate]
    ?previouslySelectedDate
    :(snapshot.activeDate&&dailyResults[snapshot.activeDate]?snapshot.activeDate:availableDates[0]);
  setDataMode("cloud",`Uppdaterad ${formatUpdatedAt(snapshot.generatedAt||snapshot.savedAt||Date.now())}.`);diagnostics.lastLoad=new Date().toISOString();diagnostics.placeCount=places.length;
  const updated=snapshot.generatedAt||snapshot.savedAt||Date.now();
  const meta=snapshot.meta||{},available=meta.placesAvailable??new Set(Object.values(dailyResults).flat().map(r=>r.place)).size;
  const fresh=meta.placesFresh??meta.placesUpdated??available,fallback=meta.placesFallback??Math.max(0,available-fresh);
  $("modelCount").textContent=`Moln · uppdaterad ${formatUpdatedAt(updated)} · ${available}/${meta.placesRequested||places.length} orter${fallback?` (${fresh} färska, ${fallback} reserv)`:""}`;
  $("modelCount").title="Centralt beräknad och cachad prognos";
  $("statusCard").classList.add("hidden");renderTabs();renderActivities();renderDay();
  saveWeatherCache({sourceStatus:snapshot.sourceStatus||[],cloud:true,generatedAt:updated});
  scheduleBackgroundRefresh(updated);
}

window.vaderkompassenDiagnostics=diagnostics;
async function resilientFetch(url,{timeout=REQUEST_TIMEOUT_MS,retries=REQUEST_RETRIES}={}){
  const cached=responseCache.get(url);
  if(cached&&Date.now()-cached.saved<RESPONSE_CACHE_TTL_MS)return new Response(cached.body,{status:200,headers:{"Content-Type":"application/json"}});
  let lastError;
  for(let attempt=0;attempt<=retries;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeout);
    try{
      const response=await fetch(url,{signal:controller.signal,cache:"no-store"});
      clearTimeout(timer);
      if(response.ok){
        const body=await response.text();
        responseCache.set(url,{saved:Date.now(),body});
        return new Response(body,{status:200,headers:{"Content-Type":response.headers.get("Content-Type")||"application/json"}});
      }
      lastError=new Error(`HTTP ${response.status}`);
      if(response.status<500&&response.status!==429)throw lastError;
      if(response.status===429){
        const retryAfter=Number(response.headers.get("Retry-After"));
        const wait=Math.min(4000,Number.isFinite(retryAfter)&&retryAfter>0?retryAfter*1000:[1800,3500][attempt]||3500);
        if(attempt<retries)await sleep(wait);
        continue;
      }
    }catch(error){
      clearTimeout(timer);
      lastError=error?.name==="AbortError"?new Error("tidsgränsen överskreds"):error;
    }
    if(attempt<retries)await sleep(1200*(attempt+1));
  }
  throw lastError||new Error("nätverksfel");
}
async function fetchModelBatch(label,model,places){
  const query={latitude:places.map(p=>p[3]).join(","),longitude:places.map(p=>p[4]).join(","),daily:DAILY,timezone:"auto",forecast_days:"7",wind_speed_unit:"ms"};
  if(model.model)query.models=model.model;
  const params=new URLSearchParams(query);
  const endpoint=model.endpoint||"https://api.open-meteo.com/v1/forecast";
  let res;
  try{res=await resilientFetch(`${endpoint}?${params}`)}
  catch(error){throw new Error(`${label}: ${error.message}`)}
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{const d=item.daily||{};(d.time||[]).forEach((day,i)=>rows.push({place:places[pi][0],area:places[pi][1],region:places[pi][2],lat:places[pi][3],lon:places[pi][4],day,model:label,temp:validNumber(d.temperature_2m_max?.[i]),min:validNumber(d.temperature_2m_min?.[i]),rain:validNumber(d.precipitation_sum?.[i]),risk:validNumber(d.precipitation_probability_max?.[i]),sun:validNumber(d.sunshine_duration?.[i])===null?null:validNumber(d.sunshine_duration?.[i])/3600,wind:validNumber(d.wind_speed_10m_max?.[i]),windDirection:validNumber(d.wind_direction_10m_dominant?.[i])}));});
  return rows;
}
async function fetchOpenMeteo(label,model,places){
  const scoped=model.country?places.filter(p=>countryFor({region:p[2]})===model.country):places;
  if(!scoped.length)throw new Error(`${label}: inga orter inom källans täckning`);
  const batches=chunks(scoped,BATCH_SIZE);
  const results=await mapWithConcurrency(batches,MAX_BATCH_CONCURRENCY,batch=>fetchModelBatch(label,model,batch));
  const rows=results.filter(x=>x.status==="fulfilled").flatMap(x=>x.value);
  if(!rows.length){
    const details=[...new Set(results.filter(x=>x.status==="rejected").map(x=>x.reason?.message).filter(Boolean))].slice(0,2).join("; ");
    throw new Error(`${label}: ${details||"inga data"}`);
  }
  return rows;
}

function smhiParameter(step,name){
  return validNumber((step.parameters||[]).find(p=>p.name===name)?.values?.[0]);
}
function smhiDayKey(iso){
  return new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(iso));
}
async function fetchSmhiPlace(place){
  const [name,area,region,lat,lon]=place;
  const url=`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(6)}/lat/${lat.toFixed(6)}/data.json`;
  let res;
  try{res=await resilientFetch(url,{timeout:14000,retries:1})}
  catch(error){throw new Error(`SMHI ${name}: ${error.message}`)}
  const data=await res.json(),days={};
  (data.timeSeries||[]).forEach(step=>{
    const day=smhiDayKey(step.validTime),hour=new Date(step.validTime).getUTCHours();
    const t=smhiParameter(step,"t"),precip=smhiParameter(step,"pmean")??smhiParameter(step,"pmedian"),wind=smhiParameter(step,"ws"),windDirection=smhiParameter(step,"wd"),cloud=smhiParameter(step,"tcc_mean")??smhiParameter(step,"tcc"),pcat=smhiParameter(step,"pcat");
    const d=days[day]||={temps:[],rain:0,wetHours:0,sunHours:0,winds:[],windDirections:[]};
    if(Number.isFinite(t))d.temps.push(t);
    if(Number.isFinite(precip))d.rain+=Math.max(0,precip);
    if((Number.isFinite(precip)&&precip>.05)||(Number.isFinite(pcat)&&pcat>0))d.wetHours++;
    if(Number.isFinite(wind))d.winds.push(wind);
    if(Number.isFinite(windDirection))d.windDirections.push(windDirection);
    if(hour>=4&&hour<=20&&Number.isFinite(cloud))d.sunHours+=clamp(100-(cloud/8*100))/100;
  });
  return Object.entries(days).slice(0,7).map(([day,d])=>({
    place:name,area,region,lat,lon,day,model:"SMHI",
    temp:d.temps.length?Math.max(...d.temps):null,min:d.temps.length?Math.min(...d.temps):null,
    rain:d.rain,risk:clamp(d.wetHours/24*100),sun:d.sunHours,
    wind:d.winds.length?Math.max(...d.winds):null,windDirection:circularMean(d.windDirections)
  }));
}
async function fetchSmhi(places){
  const swedish=places.filter(p=>countryFor({region:p[2]})==="SE");
  if(!swedish.length)throw new Error("SMHI: inga svenska orter valda");
  // Alla valda svenska orter uppdateras. Låg parallellitet skyddar punkt-API:t.
  const {rows,results}=await fetchPlacesPersistently("SMHI",swedish,fetchSmhiPlace);
  if(!rows.length)throw new Error("SMHI: inga data");
  return rows;
}
async function fetchSource(label,source,places){
  return source.type==="smhi"?fetchSmhi(places):fetchOpenMeteo(label,source,places);
}

function hourlyDailyMean(times,values){
  const out={};
  (times||[]).forEach((t,i)=>{
    const day=String(t).slice(0,10),v=validNumber(values?.[i]);
    if(Number.isFinite(v))(out[day]||=[]).push(v);
  });
  return Object.fromEntries(Object.entries(out).map(([d,v])=>[d,mean(v)]));
}
function hourlyDailyMax(times,values){
  const out={};
  (times||[]).forEach((t,i)=>{
    const day=String(t).slice(0,10),v=validNumber(values?.[i]);
    if(Number.isFinite(v))out[day]=Math.max(out[day]??-Infinity,v);
  });
  return out;
}
async function fetchMarine(places){
  const marine=places.filter(p=>MARINE_COORDS[p[0]]);
  if(!marine.length)return [];
  const params=new URLSearchParams({
    latitude:marine.map(p=>MARINE_COORDS[p[0]][0]).join(","),
    longitude:marine.map(p=>MARINE_COORDS[p[0]][1]).join(","),
    daily:MARINE_DAILY,hourly:MARINE_HOURLY,timezone:"auto",forecast_days:"7",cell_selection:"sea"
  });
  const res=await resilientFetch(`https://marine-api.open-meteo.com/v1/marine?${params}`,{retries:3});
  if(!res.ok)throw new Error(`Havsdata: ${res.status}`);
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{
    const p=marine[pi],d=item.daily||{},h=item.hourly||{};
    const seaByDay=hourlyDailyMean(h.time,h.sea_surface_temperature);
    (d.time||[]).forEach((day,i)=>rows.push({
      place:p[0],day,kind:"marine",
      waveHeight:validNumber(d.wave_height_max?.[i]),waveDirection:validNumber(d.wave_direction_dominant?.[i]),wavePeriod:validNumber(d.wave_period_max?.[i]),
      swellHeight:validNumber(d.swell_wave_height_max?.[i]),swellDirection:validNumber(d.swell_wave_direction_dominant?.[i]),swellPeriod:validNumber(d.swell_wave_period_max?.[i]),
      seaTemp:validNumber(seaByDay[day])
    }));
  });
  return rows;
}
async function fetchSnow(places){
  const ski=places.filter(p=>SKI_PLACES.has(p[0]));
  if(!ski.length)return [];
  const params=new URLSearchParams({
    latitude:ski.map(p=>p[3]).join(","),longitude:ski.map(p=>p[4]).join(","),
    daily:SNOW_DAILY,hourly:SNOW_HOURLY,timezone:"auto",forecast_days:"7"
  });
  const res=await resilientFetch(`https://api.open-meteo.com/v1/forecast?${params}`,{retries:3});
  if(!res.ok)throw new Error(`Snödata: ${res.status}`);
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{
    const p=ski[pi],d=item.daily||{},h=item.hourly||{};
    const depthByDay=hourlyDailyMax(h.time,h.snow_depth);
    const freezeByDay=hourlyDailyMean(h.time,h.freezing_level_height);
    (d.time||[]).forEach((day,i)=>rows.push({
      place:p[0],day,kind:"snow",
      snowDepth:Number.isFinite(depthByDay[day])?depthByDay[day]*100:null,
      newSnow:validNumber(d.snowfall_sum?.[i]),freezingLevel:validNumber(freezeByDay[day])
    }));
  });
  return rows;
}

async function withDeadline(promise,ms,label){
  let timer;
  try{
    return await Promise.race([
      promise,
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label}: tog för lång tid`)),ms)})
    ]);
  }finally{clearTimeout(timer)}
}
function balancedPlaces(places,maxPerCountry=18){
  const countries={SE:[],NO:[],DK:[]};
  places.forEach(p=>{const c=countryFor({region:p[2]});if(countries[c])countries[c].push(p)});
  return Object.values(countries).flatMap(list=>{
    if(list.length<=maxPerCountry)return list;
    const picked=[],used=new Set();
    // Minst en ort från varje valt område så små områden inte försvinner ur prognosen.
    const byArea=new Map();
    list.forEach(p=>{if(!byArea.has(p[1]))byArea.set(p[1],[]);byArea.get(p[1]).push(p)});
    for(const areaPlaces of byArea.values()){
      if(picked.length>=maxPerCountry)break;
      const p=areaPlaces[Math.floor((areaPlaces.length-1)/2)];
      picked.push(p);used.add(p[0]+"|"+p[3]+"|"+p[4]);
    }
    // Fyll resten geografiskt jämnt över hela landets valda orter.
    const remaining=list.filter(p=>!used.has(p[0]+"|"+p[3]+"|"+p[4]));
    const slots=maxPerCountry-picked.length;
    if(slots>0&&remaining.length){
      const step=remaining.length/slots;
      for(let i=0;i<slots;i++){
        const p=remaining[Math.min(remaining.length-1,Math.floor(i*step))];
        const key=p[0]+"|"+p[3]+"|"+p[4];
        if(!used.has(key)){picked.push(p);used.add(key)}
      }
    }
    return picked;
  });
}
function representativePlaces(places,maxPerCountry=18){return balancedPlaces(places,maxPerCountry)}
function metNoDayKey(iso){return String(iso).slice(0,10)}
async function fetchMetNoPlace(place){
  const [name,area,region,lat,lon]=place;
  const url=`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  let res;
  try{res=await resilientFetch(url,{timeout:12000,retries:0})}
  catch(error){throw new Error(`MET Norway ${name}: ${error.message}`)}
  const data=await res.json(),days={};
  (data.properties?.timeseries||[]).forEach(step=>{
    const day=metNoDayKey(step.time),instant=step.data?.instant?.details||{};
    const next=step.data?.next_1_hours?.details||step.data?.next_6_hours?.details||{};
    const d=days[day]||={temps:[],rain:0,wetHours:0,sunHours:0,winds:[],windDirections:[]};
    const t=validNumber(instant.air_temperature),wind=validNumber(instant.wind_speed),wd=validNumber(instant.wind_from_direction),cloud=validNumber(instant.cloud_area_fraction),precip=validNumber(next.precipitation_amount);
    if(Number.isFinite(t))d.temps.push(t);
    if(Number.isFinite(wind))d.winds.push(wind);
    if(Number.isFinite(wd))d.windDirections.push(wd);
    if(Number.isFinite(precip)){d.rain+=Math.max(0,precip);if(precip>.05)d.wetHours++}
    const hour=new Date(step.time).getUTCHours();
    if(hour>=4&&hour<=20&&Number.isFinite(cloud))d.sunHours+=clamp(100-cloud)/100;
  });
  return Object.entries(days).slice(0,7).map(([day,d])=>({
    place:name,area,region,lat,lon,day,model:"MET Norway",
    temp:d.temps.length?Math.max(...d.temps):null,min:d.temps.length?Math.min(...d.temps):null,
    rain:d.rain,risk:clamp(d.wetHours/24*100),sun:d.sunHours,
    wind:d.winds.length?Math.max(...d.winds):null,windDirection:circularMean(d.windDirections)
  }));
}
async function fetchMetNo(places){
  if(!places.length)throw new Error("MET Norway: inga orter valda");
  // Alla valda norska/danska orter uppdateras med kontrollerad parallellitet.
  const {rows,results}=await fetchPlacesPersistently("MET Norway",places,fetchMetNoPlace);
  if(!rows.length)throw new Error("MET Norway: inga data");
  return rows;
}

async function load({background=false}={}){
  if(loadInProgress)return;
  loadInProgress=true;
  const selected=new Set(settings.regions),selectedAreas=new Set(settings.areas);
  const places=PLACES.filter(p=>selected.has(p[2])&&selectedAreas.has(p[1]));
  if(!places.length){loadInProgress=false;showError("Välj minst en region i inställningarna.");return}
  setDataMode("checking");
  if(!background)showStatus(cloudApiEnabled()?`Hämtar central prognos för ${places.length} valda orter…`:`Hämtar stabil prognos för ${places.length} valda orter…`);
  try{
    if(cloudApiEnabled()){
      try{
        const snapshot=await fetchCloudSnapshot(places);
        if(snapshot){applyCloudSnapshot(snapshot,places);return}
      }catch(cloudError){
        diagnostics.cloudError=cloudError.message;
        if(!CLOUD_CONFIG.allowLocalFallback)throw cloudError;
        console.warn("Moln-API otillgängligt – använder lokal reservmotor:",cloudError);
      }
    }
    setDataMode("local",diagnostics.cloudError?`Molnfel: ${diagnostics.cloudError}`:"Molnläge är inte aktiverat.");
    let rows=[];
    const sourceStatus=[];
    const swedish=places.filter(p=>countryFor({region:p[2]})==="SE");
    const nordicOther=places.filter(p=>countryFor({region:p[2]})!=="SE");

    if(swedish.length){
      try{
        const smhiRows=await withDeadline(fetchSmhi(swedish),600000,"SMHI");
        rows.push(...smhiRows);sourceStatus.push({name:"SMHI",ok:true,rows:smhiRows.length,error:""});
      }catch(reason){
        sourceStatus.push({name:"SMHI",ok:false,rows:0,error:reason?.message||"fel"});
        try{
          const metFallback=await withDeadline(fetchMetNo(swedish),600000,"MET Norway reserv");
          rows.push(...metFallback);sourceStatus.push({name:"MET Norway reserv",ok:true,rows:metFallback.length,error:""});
        }catch(fallbackReason){sourceStatus.push({name:"MET Norway reserv",ok:false,rows:0,error:fallbackReason?.message||"fel"})}
      }
    }
    if(nordicOther.length){
      try{
        const metRows=await withDeadline(fetchMetNo(nordicOther),600000,"MET Norway");
        rows.push(...metRows);sourceStatus.push({name:"MET Norway",ok:true,rows:metRows.length,error:""});
      }catch(reason){sourceStatus.push({name:"MET Norway",ok:false,rows:0,error:reason?.message||"fel"})}
    }

    diagnostics.lastLoad=new Date().toISOString();diagnostics.sources=sourceStatus;diagnostics.placeCount=places.length;
    console.table(sourceStatus);
    if(!rows.length)throw new Error(`Ingen väderkälla svarade. ${sourceStatus.map(x=>`${x.name}: ${x.error||"fel"}`).join(" · ")}`);

    let marineResult=[],snowResult=[];
    const needsMarine=["general","coast","surf","boat","fishing"].includes(settings.activity);
    const needsSnow=settings.activity==="ski";
    const extraJobs=[];
    if(needsMarine)extraJobs.push(["marine",withDeadline(fetchMarine(places),EXTRA_TIMEOUT_MS,"Havsdata")]);
    if(needsSnow)extraJobs.push(["snow",withDeadline(fetchSnow(places),EXTRA_TIMEOUT_MS,"Snödata")]);
    if(extraJobs.length){
      const extraResults=await Promise.allSettled(extraJobs.map(x=>x[1]));
      extraResults.forEach((result,i)=>{if(result.status!=="fulfilled")return;if(extraJobs[i][0]==="marine")marineResult=result.value;if(extraJobs[i][0]==="snow")snowResult=result.value});
    }

    dailyResults=aggregate(rows,marineResult,snowResult);activeDate=Object.keys(dailyResults).sort()[0];
    if(!activeDate)throw new Error("Väderkällan svarade men prognosdata kunde inte tolkas.");
    const ok=sourceStatus.filter(x=>x.ok).length;
    const failed=sourceStatus.filter(x=>!x.ok);
    $("modelCount").textContent=`Nationella källor · ${ok}/${sourceStatus.length} svarade · ${new Set(rows.map(r=>r.place)).size}/${places.length} prognosorter`;
    $("modelCount").title=failed.map(x=>`${x.name}: ${x.error||"okänt fel"}`).join("\n");
    $("statusCard").classList.add("hidden");renderTabs();renderActivities();renderDay();
    saveWeatherCache({sourceStatus});
    scheduleBackgroundRefresh();
  }catch(e){
    if(background){
      console.warn("Bakgrundsuppdateringen misslyckades:",e);
      const cache=readWeatherCache();
      if(cache){
        $("modelCount").textContent=`${cache.modelText||"Sparad prognos"} · senast uppdaterad ${formatUpdatedAt(cache.savedAt)} · bakgrundsuppdatering misslyckades`;
        setDataMode(cache.cloud?"cachedCloud":"cachedLocal","Bakgrundsuppdateringen misslyckades.");
      }
      scheduleBackgroundRefresh(Date.now());
    }else showError(`${e.message} Kontrollera internetanslutningen.`)
  }finally{loadInProgress=false}
}

function aggregate(rows,marineRows=[],snowRows=[]){
  const groups={};rows.forEach(r=>(groups[`${r.day}|${r.place}`]||=[]).push(r));
  const extras={};
  [...marineRows,...snowRows].forEach(r=>Object.assign(extras[`${r.day}|${r.place}`]||={},r));
  const result={};
  Object.values(groups).forEach(g=>{
    const valid=g.filter(x=>Number.isFinite(x.temp));if(!valid.length)return;
    const f=g[0],extra=extras[`${f.day}|${f.place}`]||{},item={
      day:f.day,place:f.place,area:f.area,region:f.region,lat:f.lat,lon:f.lon,
      temp:weightedMean(g,"temp"),min:weightedMean(g,"min"),rain:weightedMean(g,"rain"),
      risk:weightedMean(g,"risk"),sun:weightedMean(g,"sun"),wind:weightedMean(g,"wind"),windDirection:circularMean(g.map(x=>x.windDirection)),models:valid.length,
      waveHeight:validNumber(extra.waveHeight),waveDirection:validNumber(extra.waveDirection),wavePeriod:validNumber(extra.wavePeriod),
      swellHeight:validNumber(extra.swellHeight),swellDirection:validNumber(extra.swellDirection),swellPeriod:validNumber(extra.swellPeriod),
      seaTemp:validNumber(extra.seaTemp),snowDepth:validNumber(extra.snowDepth),
      newSnow:validNumber(extra.newSnow),freezingLevel:validNumber(extra.freezingLevel)
    };
    item.usedSources=[...new Set(valid.map(x=>x.model))];
    item.primarySource=dominantSource(valid,item);
    item.hasMarine=Number.isFinite(item.waveHeight)||Number.isFinite(item.seaTemp);
    item.hasSnow=SKI_PLACES.has(item.place)&&(Number.isFinite(item.snowDepth)||Number.isFinite(item.newSnow));
    item.confidence=Math.round(clamp(100-std(g.map(x=>x.temp))*5-std(g.map(x=>x.rain))*9-std(g.map(x=>x.wind))*4));
    (result[item.day]||=[]).push(item);
  });return result;
}
function rankedList(){
  const serverRanked=cloudRankings[activeDate];
  let list=activityPlaces((serverRanked?.length?serverRanked:dailyResults[activeDate])||[]);
  if(["coast","surf","boat","fishing"].includes(settings.activity)){
    const specialized=list.filter(x=>x.hasMarine);if(specialized.length)list=specialized;
  }
  if(settings.activity==="ski"){
    const specialized=list.filter(x=>x.hasSnow);if(specialized.length)list=specialized;
  }
  if(serverRanked?.length)return list.map(x=>({...x,score:Number.isFinite(x.score)?x.score:(x.serverScores?.[settings.activity]??Math.round(activityScore(x)))}));
  list=list.map(x=>({...x,score:x.serverScores?.[settings.activity]??Math.round(activityScore(x))}));
  return list.sort((a,b)=>b.score-a.score||b.confidence-a.confidence);
}
function renderTabs(){
  const nav=$("dayTabs");nav.innerHTML="";
  Object.keys(dailyResults).sort().forEach((day,i)=>{
    const d=new Date(day+"T12:00:00"),b=document.createElement("button");
    b.type="button";
    b.innerHTML=`${i===0?"Idag":d.toLocaleDateString("sv-SE",{weekday:"short"})}<small>${d.toLocaleDateString("sv-SE",{day:"numeric",month:"numeric"})}</small>`;
    b.className=day===activeDate?"active":"";
    b.setAttribute("aria-pressed",day===activeDate?"true":"false");
    b.onclick=()=>{
      activeDate=day;
      saveWeatherCache({cloud:cloudApiEnabled()});
      renderTabs();
      renderDay();
    };
    nav.appendChild(b);
  });
}
function specialMetricHtml(r){
  if(["coast","surf","boat","fishing"].includes(settings.activity)){
    const waveDirection=Number.isFinite(r.waveDirection)?`${compassDirection(r.waveDirection)} ${Math.round(r.waveDirection)}°`:"–";
    if(settings.activity==="surf"){
      const target=offshoreWindFromDirection(r),offshore=Math.round(surfOffshoreScore(r));
      const windDirection=Number.isFinite(r.windDirection)?`${compassDirection(r.windDirection)} ${Math.round(r.windDirection)}°`:"–";
      return `<span>🌊 ${fmt(r.waveHeight)} m</span><span>🧭 Våg ${waveDirection}</span><span>↔️ ${fmt(r.wavePeriod,0)} s</span><span>💨 ${windDirection}</span><span>🏖️ Frånland ${offshore}/100</span>`;
    }
    return `<span>🌊 ${fmt(r.waveHeight)} m</span><span>🧭 Våg ${waveDirection}</span><span>↔️ ${fmt(r.wavePeriod,0)} s</span><span>🏄 ${fmt(r.swellHeight)} m</span><span>🌡️ Hav ${fmt(r.seaTemp,0)}°</span>`;
  }
  if(settings.activity==="ski"){
    return `<span>❄️ ${fmt(r.snowDepth,0)} cm</span><span>🌨️ ${fmt(r.newSnow)} cm</span><span>🏔️ 0° ${fmt(r.freezingLevel,0)} m</span>`;
  }
  return "";
}
function winnerMetricCards(r){
  const card=(icon,value,label,detail="")=>`<article><span>${icon}</span><strong>${value}</strong><small>${label}</small>${detail?`<em>${detail}</em>`:""}</article>`;
  if(settings.activity==="surf")return [
    card("🌊",`${fmt(r.waveHeight)} m`,"vågor",`${fmt(r.wavePeriod,0)} s`),
    card("💨",`${fmt(r.wind)} m/s`,"vind",Number.isFinite(r.windDirection)?compassDirection(r.windDirection):""),
    card("☀️",`${fmt(r.sun)} h`,"sol"),
    card("🌡️",`${fmt(r.temp,0)}°`,"temperatur")
  ].join("");
  if(["coast","boat","fishing"].includes(settings.activity))return [
    card("🌊",`${fmt(r.waveHeight)} m`,"vågor",`${fmt(r.wavePeriod,0)} s`),
    card("💨",`${fmt(r.wind)} m/s`,"vind",Number.isFinite(r.windDirection)?compassDirection(r.windDirection):""),
    card("🌡️",`${fmt(r.seaTemp,0)}°`,"hav"),
    card("🌡️",`${fmt(r.temp,0)}°`,"temperatur")
  ].join("");
  if(settings.activity==="ski")return [
    card("❄️",`${fmt(r.snowDepth,0)} cm`,"snödjup"),
    card("🌨️",`${fmt(r.newSnow)} cm`,"nysnö"),
    card("🌡️",`${fmt(r.temp,0)}°`,"temperatur"),
    card("💨",`${fmt(r.wind)} m/s`,"vind")
  ].join("");
  return [
    card("🌡️",`${fmt(r.temp,0)}°`,"temperatur"),
    card("🌧️",`${fmt(r.rain)} mm`,"regn"),
    card("☀️",`${fmt(r.sun)} h`,"sol"),
    card("💨",`${fmt(r.wind)} m/s`,"vind")
  ].join("");
}
function winnerDetailsHtml(r){
  const rows=[];
  const add=(label,value)=>{if(value!==null&&value!==undefined&&value!==""&&value!=="–")rows.push(`<div><dt>${label}</dt><dd>${value}</dd></div>`)};
  add("Prognosdag",new Date(r.day+"T12:00:00").toLocaleDateString("sv-SE",{weekday:"long",day:"numeric",month:"long"}));
  add("Max temperatur",`${fmt(r.temp,0)} °C`);
  add("Min temperatur",`${fmt(r.min,0)} °C`);
  add("Nederbörd",`${fmt(r.rain)} mm`);
  add("Risk för nederbörd",`${fmt(r.risk,0)} %`);
  add("Beräknad sol",`${fmt(r.sun)} h`);
  add("Vind",`${fmt(r.wind)} m/s`);
  if(Number.isFinite(r.windDirection))add("Vindriktning",`${compassDirection(r.windDirection)} · ${Math.round(r.windDirection)}°`);
  add("Prognossäkerhet",`${fmt(r.confidence,0)} %`);
  add("Aktivitetsbetyg",`${fmt(r.score,0)} / 100`);
  add("Antal modeller",fmt(r.models,0));
  add("Viktigaste källa",r.primarySource);
  if(Array.isArray(r.usedSources)&&r.usedSources.length)add("Använda källor",r.usedSources.join(", "));
  if(Number.isFinite(r.waveHeight))add("Våghöjd",`${fmt(r.waveHeight)} m`);
  if(Number.isFinite(r.waveDirection))add("Vågriktning",`${compassDirection(r.waveDirection)} · ${Math.round(r.waveDirection)}°`);
  if(Number.isFinite(r.wavePeriod))add("Vågperiod",`${fmt(r.wavePeriod,0)} s`);
  if(Number.isFinite(r.swellHeight))add("Dyningshöjd",`${fmt(r.swellHeight)} m`);
  if(Number.isFinite(r.swellDirection))add("Dyningsriktning",`${compassDirection(r.swellDirection)} · ${Math.round(r.swellDirection)}°`);
  if(Number.isFinite(r.swellPeriod))add("Dyningsperiod",`${fmt(r.swellPeriod,0)} s`);
  if(Number.isFinite(r.seaTemp))add("Havstemperatur",`${fmt(r.seaTemp,0)} °C`);
  if(Number.isFinite(r.snowDepth))add("Snödjup",`${fmt(r.snowDepth,0)} cm`);
  if(Number.isFinite(r.newSnow))add("Nysnö",`${fmt(r.newSnow)} cm`);
  if(Number.isFinite(r.freezingLevel))add("Nollgradersnivå",`${fmt(r.freezingLevel,0)} m`);
  add("Område",`${r.area} · ${r.region}`);
  add("Position",`${Number(r.lat).toFixed(4)}, ${Number(r.lon).toFixed(4)}`);
  return `<dl>${rows.join("")}</dl>`;
}
function setWinnerDetails(r){
  const wrap=$("winnerDetailsWrap"),details=$("winnerDetails"),more=$("winnerMore");
  details.innerHTML=winnerDetailsHtml(r);
  details.hidden=true;more.textContent="Visa mer";more.setAttribute("aria-expanded","false");
  wrap.classList.remove("hidden");
}
function toggleWinnerDetails(){
  const details=$("winnerDetails"),more=$("winnerMore"),open=details.hidden;
  details.hidden=!open;more.textContent=open?"Visa mindre":"Visa mer";more.setAttribute("aria-expanded",String(open));
}
function scoreColor(score){return score>=90?"#29974a":score>=80?"#78bd8a":score>=70?"#e4bd3d":score>=60?"#ed9653":"#e66b69";}
function scoreClass(score){return score>=90?"perfect":score>=80?"great":score>=70?"good":score>=60?"okay":"poor";}
function ensureMap(){
  if(map||!window.L)return;
  map=L.map("weatherMap",{
    zoomControl:false,
    attributionControl:true,
    dragging:true,
    touchZoom:true,
    scrollWheelZoom:true,
    doubleClickZoom:true,
    boxZoom:true,
    keyboard:true,
    zoomSnap:0.5,
    zoomDelta:0.5,
    wheelPxPerZoomLevel:60,
    bounceAtZoomLimits:false
  }).setView([60.2,15.4],5);
  L.control.zoom({position:"bottomright"}).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; OpenStreetMap',className:"pastel-map-tiles"}).addTo(map);
  markerLayer=L.layerGroup().addTo(map);
  map.whenReady(()=>{
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
  });
}
function mapPopupHtml(r,position){
  const activity=ACTIVITIES[settings.activity];
  return `<article class="map-popup-card"><div class="map-popup-top"><span class="map-popup-rank">${position}</span><div><strong>${placeLabel(r)}</strong><small>${r.area} · ${r.region}</small></div><b class="map-popup-score ${scoreClass(r.score)}">${r.score}</b></div><p>${activitySummary(r.score)} för ${activity.label.toLowerCase()}</p><div class="map-popup-metrics"><span>🌡️ <b>${fmt(r.temp,0)}°</b></span><span>💨 <b>${fmt(r.wind)} m/s</b></span>${settings.activity==="surf"?`<span>🌊 <b>${fmt(r.waveHeight)} m</b></span>`:`<span>☀️ <b>${fmt(r.sun)} h</b></span>`}</div><a href="https://maps.apple.com/?q=${encodeURIComponent(placeLabel(r))}&ll=${r.lat},${r.lon}" target="_blank" rel="noopener">Visa vägen →</a></article>`;
}
function renderMap(list){
  ensureMap();if(!map||!markerLayer)return;
  markerLayer.clearLayers();
  list.slice(0,75).forEach((r,i)=>{
    const cls=scoreClass(r.score),icon=L.divIcon({className:"score-marker-wrap",html:`<div class="score-marker ${cls}${i===0?" winner":""}"><span>${r.score}</span></div>`,iconSize:[48,48],iconAnchor:[24,24],popupAnchor:[0,-23]});
    const m=L.marker([r.lat,r.lon],{icon,zIndexOffset:i===0?1000:Math.max(0,500-i)});
    m.bindPopup(mapPopupHtml(r,i+1),{className:"vk-map-popup",maxWidth:290,minWidth:240,closeButton:true});m.addTo(markerLayer);
  });
  if(list.length){const bounds=L.latLngBounds(list.map(r=>[r.lat,r.lon]));map.fitBounds(bounds,{padding:[30,30],maxZoom:7});}
}
function toggleMap(){const section=$("mapSection"),button=$("showMapBtn");section.classList.toggle("hidden");const open=!section.classList.contains("hidden");button.textContent=open?"✕ Dölj kartan":"🗺 Visa topplistan på karta";button.setAttribute("aria-expanded",String(open));if(open){renderMap(rankedList());setTimeout(()=>map?.invalidateSize(),80);section.scrollIntoView({behavior:"smooth",block:"nearest"});}}
function renderDay(){
  const list=rankedList();if(!list.length)return;
  if(!$("mapSection").classList.contains("hidden"))renderMap(list);
  const best=list[0],activity=ACTIVITIES[settings.activity];
  $("bestEyebrow").textContent=`BÄST ${activity.label.toUpperCase()}`;
  $("bestPlace").textContent=placeLabel(best);
  $("bestRegion").textContent=settings.sourceMode==="auto"
    ? `${best.area} · ${best.region} · Tyngst: ${best.primarySource}`
    : `${best.area} · ${best.region} · ${best.usedSources.length} valda källor`;
  $("bestSummary").textContent=activitySummary(best.score);
  $("bestReason").textContent=decisionSentence(best);
  $("bestScore").textContent=best.score;$("hero").dataset.score=best.score;
  $("metrics").innerHTML=winnerMetricCards(best);
  setWinnerDetails(best);
  $("mapLink").href=`https://maps.apple.com/?q=${encodeURIComponent(placeLabel(best))}&ll=${best.lat},${best.lon}`;
  ["hero","metrics","mapLink"].forEach(id=>$(id).classList.remove("hidden"));
  const ranking=$("ranking");ranking.innerHTML="";
  list.slice(0,15).forEach((r,i)=>{
    const card=$("rankTemplate").content.cloneNode(true);
    card.querySelector(".rank-card").dataset.score=r.score;
    card.querySelector(".rank-number").textContent=i+1;
    card.querySelector("h3").textContent=placeLabel(r);
    card.querySelector("p").textContent=`${r.area} · ${r.region} · ${activitySummary(r.score)}`;
    card.querySelector(".mini-metrics").innerHTML=`<span>🌡️ ${fmt(r.temp,0)}°</span><span>🌧️ ${fmt(r.rain)} mm</span><span>☀️ ${fmt(r.sun)} h</span><span>💨 ${fmt(r.wind)} m/s</span>${specialMetricHtml(r)}<span>🎯 ${r.confidence}%</span>`;
    card.querySelector(".rank-score").textContent=r.score;ranking.appendChild(card);
  });
}
function showStatus(t){$("status").textContent=t;$("statusCard").classList.remove("hidden","error");$("statusCard").querySelector(".spinner").style.display=""}
function showError(t){$("status").textContent=t;$("statusCard").classList.remove("hidden");$("statusCard").classList.add("error");$("statusCard").querySelector(".spinner").style.display="none"}
function syncSettings(){
  $("tempTarget").value=settings.temp;$("tempOut").textContent=`${settings.temp} °C`;
  $("rainWeight").value=settings.rain;$("sunWeight").value=settings.sun;$("windWeight").value=settings.wind;
  $("sourceMode").value=settings.sourceMode;renderRegionChoices();renderSourceChoices();
}
$("showMapBtn").onclick=toggleMap;
$("winnerMore").onclick=toggleWinnerDetails;
$("settingsBtn").onclick=()=>{syncSettings();$("settingsDialog").showModal()};
$("tempTarget").oninput=e=>$("tempOut").textContent=`${e.target.value} °C`;
$("sourceMode").onchange=renderSourceChoices;
$("selectAllRegions").onclick=e=>{e.preventDefault();document.querySelectorAll("#regionChoices input").forEach(x=>x.checked=true)};
$("clearRegions").onclick=e=>{e.preventDefault();document.querySelectorAll("#regionChoices input").forEach(x=>x.checked=false)};
$("filterSweden").onclick=e=>{e.preventDefault();selectCountry("Sverige")};
$("filterDenmark").onclick=e=>{e.preventDefault();selectCountry("Danmark")};
$("filterNorway").onclick=e=>{e.preventDefault();selectCountry("Norge")};
$("saveSettings").onclick=e=>{
  e.preventDefault();
  const sourceMode=$("sourceMode").value;
  const sources=[...document.querySelectorAll("#sourceChoices input:checked")].map(x=>x.value);
  if(sourceMode==="manual"&&!sources.length){
    $("sourceError").textContent="Välj minst en prognoskälla.";
    $("sourceError").classList.remove("hidden");
    return;
  }
  $("sourceError").classList.add("hidden");
  settings={...settings,temp:+$("tempTarget").value,rain:+$("rainWeight").value,
    sun:+$("sunWeight").value,wind:+$("windWeight").value,sourceMode,sources,
    regions:[...document.querySelectorAll('#regionChoices input[data-kind="region"]:checked')].map(x=>x.value),
    areas:[...document.querySelectorAll('#regionChoices input[data-kind="area"]:checked')].map(x=>x.value)};
  localStorage.setItem("vk-settings",JSON.stringify(settings));$("settingsDialog").close();if(!restoreWeatherCache())load();
};
if("serviceWorker"in navigator)window.addEventListener("load",async()=>{
  const reg=await navigator.serviceWorker.register(`sw.js?v=13.9.0`);
  reg.update();
  reg.addEventListener("updatefound",()=>{const worker=reg.installing;worker?.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller){$("updateBanner").classList.remove("hidden");}})});
  navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload());
});
$("updateNow").onclick=()=>navigator.serviceWorker.getRegistration().then(r=>r?.waiting?.postMessage({type:"SKIP_WAITING"}));
renderActivities();
setDataMode("checking");
if(!restoreWeatherCache())load();
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState!=="visible")return;
  const cache=readWeatherCache();
  if(cache&&Date.now()-cache.savedAt>=BACKGROUND_REFRESH_MS)load({background:true});
});
