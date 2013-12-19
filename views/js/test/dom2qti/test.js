define(['jquery', 'taoQtiTest/controller/creator/encoders/dom2qti'], function($, Dom2Qti){
    var domStr, model;
    module('DomObject encoder', {
        setup: function() {
            domStr = '<div id="main-container" class="container">\
		<h1>The F4U Corsair</h1>\
		<img src="f4u-corsair.png" alt="A restored F4U-4 Corsair in Korean War-ear U.S. Marine Corps markings" longdesc="http://en.wikipedia.org/wiki/Vought_F4U_Corsair" height="400" width="300"/>\
		<h2>Introduction</h2>\
		<p>\
			The <strong>Chance Vought F4U Corsair</strong> was a carrier-capable fighter aircraft \
			that saw service primarily in World War II and the Korean War. Demand \
			for the aircraft soon overwhelmed Vought\'s manufacturing capability,\
			resulting in production by Goodyear and Brewster: Goodyear-built Corsairs \
			were designated <strong>FG</strong> and Brewster-built aircraft <strong>F3A</strong>. \
			From the first prototype delivery to the U.S. Navy in 1940, to final delivery in 1953 \
			to the French, 12,571 F4U Corsairs were manufactured by Vought,[1] in 16 separate models, \
			in the longest production run of any piston-engined fighter in U.S. history (1942–53).€\
		</p>\
            </div>';
            model = {
                "qti-type": "div",
                "xmlBase": "",
                "id": "main-container",
                "class": "container",
                "lang": "",
                "label": "",
                "content": [{
                        "qti-type": "h1",
                        "xmlBase": "",
                        "content": [{
                            "qti-type": "textRun",
                            "xmlBase": "",
                            "content": "The F4U Corsair"
                        }],
                        "id": "",
                        "class": "",
                        "lang": "",
                        "label": ""
                    }, {
                        "qti-type": "img",
                        "src": "f4u-corsair.png",
                        "alt" : "A restored F4U-4 Corsair in Korean War-ear U.S. Marine Corps markings",
                        "longdesc": "http:\/\/en.wikipedia.org\/wiki\/Vought_F4U_Corsair",
                        "height": "400",
                        "width": "300",
                        "id": "",
                        "class": "",
                        "lang": "",
                        "label": "",
                        "xmlBase": ""
                    }, {
                        "qti-type": "h2",
                        "xmlBase": "",
                        "content": [{
                            "qti-type": "textRun",
                            "xmlBase": "",
                            "content": "Introduction"
                        }],
                        "id": "",
                        "class": "",
                        "lang": "",
                        "label": ""
                    }, {
                        "qti-type": "p",
                        "xmlBase": "",
                        "content": [{
                            "qti-type": "textRun",
                            "xmlBase": "",
                            "content": " The "
                        }, {
                            "qti-type": "strong",
                            "xmlBase": "",
                            "content": [{
                                "qti-type": "textRun",
                                "xmlBase": "",
                                "content": "Chance Vought F4U Corsair"
                            }],
                            "id": "",
                            "class": "",
                            "lang": "",
                            "label": ""
                        }, {
                            "qti-type": "textRun",
                            "xmlBase": "",
                            "content": " was a carrier-capable fighter aircraft that saw service primarily in World War II and the Korean War. Demand for the aircraft soon overwhelmed Vought's manufacturing capability, resulting in production by Goodyear and Brewster: Goodyear-built Corsairs were designated "
                        }, {
                            "qti-type": "strong",
                            "xmlBase": "",
                            "content": [{
                                "qti-type": "textRun",
                                "xmlBase": "",
                                "content": "FG"
                            }],
                            "id": "",
                            "class": "",
                            "lang": "",
                            "label": ""
                        }, {
                            "qti-type": "textRun",
                            "xmlBase": "",
                            "content": " and Brewster-built aircraft "
                        }, {
                            "qti-type": "strong",
                            "xmlBase": "",
                            "content": [{
                                "qti-type": "textRun",
                                "xmlBase": "",
                                "content": "F3A"
                            }],
                            "id": "",
                            "class": "",
                            "lang": "",
                            "label": ""
                        }, {
                            "qti-type": "textRun",
                            "xmlBase": "",
                            "content": ". From the first prototype delivery to the U.S. Navy in 1940, to final delivery in 1953 to the French, 12,571 F4U Corsairs were manufactured by Vought,[1] in 16 separate models, in the longest production run of any piston-engined fighter in U.S. history (1942\u201353).€ "
                        }],
                        "id": "",
                        "class": "",
                        "lang": "",
                        "label": ""
                    }]
                };
        }
    });
   
    test('encode', function(){
        expect(2);
        
        ok(typeof Dom2Qti.encode === 'function');
        
        var result = Dom2Qti.encode(model);
        
        var pattern = /\s/g;
        
        equal(result.replace(pattern, ''), domStr.replace(pattern, ''));
    });
    
    test('decode', function(){
        expect(2);
        
        ok(typeof Dom2Qti.decode === 'function');
        
        var result = Dom2Qti.decode(domStr.replace(/\s+/gm, ' '));
        
        deepEqual(result, [model]);
    });
});


