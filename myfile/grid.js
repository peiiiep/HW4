window.onload = function(){

var mapSketch = function(p5j){
    p5j.earthquakes;
    p5j.loaded = 0; // 確認是否有讀取檔案
    
    p5j.control;
    //p5j.boundLU, p5j.boundRD; // 西北 東南 經緯度
    p5j.arr = [];

    // 調整 顯示層
    p5j.basic = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }); 

    p5j.mag3= new L.LayerGroup();
    p5j.mag5= new L.LayerGroup();
    p5j.mag7= new L.LayerGroup();
    

    p5j.mag3.open = false;
    p5j.mag5.open = false;
    p5j.mag7.open = false;

    p5j.overlaying = {
    		"mag3": p5j.mag3,
    		"mag5": p5j.mag5,
    		"mag7": p5j.mag7
    };

    p5j.map = L.map('map',{
        layers: [p5j.basic],
        renderer : p5j.graphic
        }).setView([0,0], 2); // 經緯度 比例

    p5j.control=L.control.layers(p5j.baseLayer, p5j.overlaying).addTo(p5j.map); // 添加層

    //console.log();
    // 變換行為
    p5j.map.on('zoomend', function(e) {
        p5j.clear();
    });
    p5j.map.on('moveend', function(e) {
        p5j.clear();
    });

    // 確認 是否有打開 layer
    p5j.control.getContainer().onclick = function(e){
        //console.log(e.target.parentElement.textContent); // 找到文字
        //console.log(e.target.checked); // 確認是否打開

        if (e.target.parentElement.textContent.replace(/ /g,"") === "mag3"){ // 去除空白字串
            if (e.target.checked){                
                p5j.mag3.open = true;
            }else{
                p5j.mag3.open = false;
            }
        }else if (e.target.parentElement.textContent.replace(/ /g,"") === "mag5"){ // 去除空白字串
            if (e.target.checked){
                p5j.mag5.open = true;
            }else{
                p5j.mag5.open = false;
            }
        }else if (e.target.parentElement.textContent.replace(/ /g,"") === "mag7"){ // 去除空白字串
            if (e.target.checked){
                p5j.mag7.open = true;
            }else{
                p5j.mag7.open = false;
            }
        }
    }
    
    // oop
    var quake = function (c1,c0,mag){
      // 初始化
      this.totalFrame = 10;
      this.currentFrame = 1;
      this.id=0;
      this.mag = mag;
      this.c1 = c1;
      this.c0 = c0;

      this.ani=p5j.random(0,100);
      this.inverse=true;

      if (this.mag>=3&&this.mag<5){
      	this.color = '#922';
      	this.layerGroup = p5j.mag3;
      }else if (this.mag>=5&&this.mag<7){
      	this.color = '#d22';
      	this.layerGroup = p5j.mag5;
      }else {
      	this.color = '#f22';
      	this.layerGroup = p5j.mag7;
      }
      // 定義 marker 物件
      this.marker = L.circle([this.c1, this.c0], { // 緯度在前面
                color: this.color,
                fillOpacity: 0.3,
                stroke: false, // 取消邊線
                radius: this.mag*80000 // 強度 乘上大小單位為公尺
              });
      this.marker.addTo(this.layerGroup).bindPopup('Here is '+this.c1+','+this.c0);

      // 更新動畫
      this.update =function(){

        let ll = this.marker.getLatLng();

        // 若不在範圍內
        if (p5j.map.getBounds().contains(ll)){
            let pix = p5j.map.latLngToLayerPoint(ll); // 轉換經緯度到畫面位置

            if (this.layerGroup.open){ // 若本layerGroup 打開
            	p5j.stroke(204,102,0);
            	p5j.ellipse(pix.x,pix.y,this.ani,this.ani);

                // 到範圍畫 反向
                if (this.inverse){
                    this.ani-=1;
                }else{
                    this.ani+=1;
                }

                if (this.ani<0){
                    this.inverse = false;
                }else if(this.ani>100){
                    this.inverse = true;
                }

                p5j.stroke(204,102,0);
                let dd = p5j.dist(pix.x,pix.y,p5j.mouseX,p5j.mouseY);
                if(dd<300){
                p5j.line(pix.x,pix.y,p5j.mouseX,p5j.mouseY);
                
            	}

            }
        }
      }
    }

    // 開始動畫
    p5j.preload = function() { // 需要先讀取 json
      // 取得日期段內的強度大於3的地震
      let url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
        'format=geojson&starttime=2020-03-11&endtime=2020-04-12&minmagnitude=3';

      p5j.httpGet(url, 'jsonp', false, function(response) {
        p5j.earthquakes = response; // 會把所有回呼資料存於 earthquakes
      });
    }

    p5j.setup = function(){
        // 加入一個畫布
    	p5j.createCanvas(1200,600).style('z-index:400'); // ****一層z-index=100*****
        //p5j.graphic = p5j.createGraphics(1200,600);
    }
    p5j.draw = function(){
        // 新圖層
      p5j.clear(); // 刪除過去的資料
      
      
      if (!p5j.earthquakes) {
        // Wait until the earthquake data has loaded before drawing.
        return;
      }else {
        if (p5j.loaded === 1){

          p5j.earthquakes.features.forEach((val)=>{
            p5j.arr.push(new quake(val.geometry.coordinates[1], val.geometry.coordinates[0], val.properties.mag));
          });

          console.log(p5j.mag5.getLayers());
        }else{
            p5j.noFill();
            p5j.stroke(180,0,0);

        	p5j.arr.forEach((q)=>{
            //    	q.curentFrame = (p5j.loaded+q.currentFrame);
                 	q.update();
            	});
        }    
        p5j.loaded +=1;
      }
        
  }
}
  
new p5(mapSketch, 'map');
}