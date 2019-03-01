'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  /**
   p0为起始点
   p1为第一个控制点，或上图中的P1
   p2为第二个控制点，或上图中的P2
   p3为结束点
   t为参数值，0 <= t <= 1
   */
  function PointOnCubicBezier(_ref, t) {
    var _ref2 = _slicedToArray(_ref, 4),
        p0 = _ref2[0],
        p1 = _ref2[1],
        p2 = _ref2[2],
        p3 = _ref2[3];

    var point = { x: 0, y: 0 };
    var temp = 1 - t;
    point.x = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
    point.y = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
    return point;
  }
  /**
   * 响应式
   * @param params 参数列表
   [
   'phone', // <400 区间类名为 phone
   [400, 80], // 400px的屏幕rem为 80px
   'pad', // 400-860 区间类名为 pad
   [860, 60],
   'pc',
   [1440, 100],
   'lg', // >1440 区间类名为 lg
   ]
   * @param options: { monitor }
   * @return function watcher return { width, rem, part: {...} }
   */
  function responsive(params, options) {
    var opt = _extends({
      monitor: false,
      watch: false,
      watchDebounce: 20,
      onChange: function onChange() {}
    }, options);
    // 准备数据
    var points = params.filter(Array.isArray);
    var stageNames = params.filter(function (t) {
      return typeof t === 'string';
    });
    var minWidth = points[0][0];
    var minWidthFixed = parseInt(0.8 * minWidth);
    var maxWidth = points[points.length - 1][0];
    var maxWidthFixed = parseInt(maxWidth * 1.05);
    var minRem = Math.min.apply(Math, _toConsumableArray(points.map(function (t) {
      return t[1];
    })));
    var maxRem = Math.max.apply(Math, _toConsumableArray(points.map(function (t) {
      return t[1];
    })));
    points.push([99999, points[points.length - 1][1]]);
    points.unshift([0, points[0][1]]);
    var parts = [];
    points.forEach(function (t, i) {
      if (i < points.length - 1) {
        parts.push([t, points[i + 1]]);
      }
    });
    parts = parts.map(function (t, i) {
      var cp0 = { x: t[0][0], y: t[0][1] };
      var cp3 = { x: t[1][0], y: t[1][1] };
      var offset = 0.2 * (cp3.x - cp0.x);
      var cp1 = { x: cp0.x + offset, y: cp0.y };
      var cp2 = { x: cp3.x - offset, y: cp3.y };
      return {
        cps: [cp0, cp1, cp2, cp3],
        color: getRandColor(cp0.x + cp0.y + cp3.x + cp3.y),
        stage: stageNames[i]
      };
    });
    // 找到对应的part
    var findPart = function findPart(px) {
      return parts.find(function (_ref3) {
        var cps = _ref3.cps;
        return px >= cps[0].x && px < cps[3].x;
      });
    };
    // 计算rem的函数
    var compute = function compute(px) {
      var _findPart = findPart(px),
          cps = _findPart.cps;

      return PointOnCubicBezier(cps, (px - cps[0].x) / (cps[3].x - cps[0].x)).y;
    };
    // 绘图
    var draw = function draw() {
      var CANVAS_ID = 'yl-responsive-canvas';
      var lastCanvas = document.getElementById(CANVAS_ID);
      if (lastCanvas) {
        document.body.removeChild(lastCanvas);
      }
      var windowWidth = getWindowWidth();
      var canvas = document.createElement('canvas');
      canvas.setAttribute('id', CANVAS_ID);
      canvas.width = 240;
      canvas.height = 180;
      canvas.style.cssText = 'border: 1px solid #ccc;position:fixed;right:10px;top:10px;box-shadow:2px 2px 8px 1px #ccc';
      document.body.appendChild(canvas);
      var ctx = canvas.getContext("2d");
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "#f9f5f1";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#3ca4ff";
      ctx.strokeStyle = "#3ca4ff";
      ctx.font = 'bold 8px Arial';
      var points = Array.apply(null, { length: canvas.width }).map(function (_, i) {
        return {
          x: coordinateTrans(i, [0, canvas.width], [minWidthFixed, maxWidthFixed]),
          y: i,
          i: i
        };
      });
      var drawPoint = {
        x: 0, y: 0
      };
      var newDrawPoint = {};
      points.forEach(function (point) {
        // 计算y
        point.y = compute(point.x);
        // 坐标转换,绘图
        newDrawPoint = {
          x: coordinateTrans(point.i, [0, canvas.width], [12, canvas.width - 12]),
          y: canvas.height - coordinateTrans(point.y, [minRem, maxRem], [12, canvas.height - 12])
        };
        if (drawPoint.x) {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.moveTo(drawPoint.x, drawPoint.y);
          ctx.lineTo(newDrawPoint.x, newDrawPoint.y);
          ctx.strokeStyle = findPart(point.x).color; // 切换颜色
          ctx.stroke();
        }
        drawPoint = newDrawPoint;
      });
      // 绘制当前windowWidth点
      ctx.fillStyle = "#ff1f2e";
      var currentRem = compute(windowWidth);
      var currentPart = findPart(windowWidth);
      var currentPoint = {
        x: coordinateTrans(windowWidth, [minWidthFixed, maxWidthFixed], [12, canvas.width - 12]),
        y: canvas.height - coordinateTrans(currentRem, [minRem, maxRem], [12, canvas.height - 12])
      };
      ctx.fillRect(currentPoint.x - 3, currentPoint.y - 3, 6, 6);
      ctx.fillText('(' + windowWidth + ', ' + currentRem.toFixed(2) + ')', canvas.width / 2 - 24, 12);

      // 绘制极值文字
      ctx.fillStyle = "#d510ff";
      ctx.fillText(minRem.toString(), 2, canvas.height - 12);
      ctx.fillText(maxRem.toString(), 2, 12);
      ctx.fillText('rem:px', 2, canvas.height / 2);
      ctx.fillText(minWidthFixed.toString(), 12, canvas.height - 2);
      ctx.fillText(maxWidthFixed.toString(), canvas.width - 20, canvas.height - 2);
      ctx.fillText('width:px', canvas.width / 2 - 15, canvas.height - 2);

      // 绘制stage图示
      parts.forEach(function (part, i) {
        ctx.fillStyle = part.color;
        ctx.fillRect(24, 10 * i + 12, 8, 6);
        ctx.fillText(part.stage + (currentPart.stage === part.stage ? ' ☑' : ' ☐'), 34, 10 * i + 18);
      });
    };
    // 设置样式
    var watcher = function watcher() {
      var windowWidth = getWindowWidth();
      var rem = compute(windowWidth);
      var html = document.getElementsByTagName('html')[0];
      html.style.fontSize = rem + 'px';
      var htmlClass = html.className;
      html.className = htmlClass.split(' ').filter(function (t) {
        return parts.map(function (part) {
          return part.stage;
        }).indexOf(t) < 0;
      }).concat(findPart(windowWidth).stage).join(' ');
      if (opt.monitor) {
        draw();
      }
      var currentPart = findPart(windowWidth);
      var result = {
        width: windowWidth,
        rem: rem,
        part: currentPart
      };
      if (opt.onChange) {
        opt.onChange(result);
      }
      return result;
    };

    // 设置一次
    watcher();

    // 监听
    if (opt.watch) {
      window.onresize = debounce(opt.watchDebounce, watcher);
    }

    if (opt.monitor) {
      draw();
    }
    return watcher;
  }

  /**
   * 一维坐标等比例转换
   * coordinateTrans(2, [0, 10], [0, 100]) => 20
   * @param t
   * @param c1min
   * @param c1max
   * @param c2min
   * @param c2max
   * @return {*}
   */
  function coordinateTrans(t, _ref4, _ref5) {
    var _ref7 = _slicedToArray(_ref4, 2),
        c1min = _ref7[0],
        c1max = _ref7[1];

    var _ref6 = _slicedToArray(_ref5, 2),
        c2min = _ref6[0],
        c2max = _ref6[1];

    // (t-c1min)/(c1max-c1min) = (y-c2min)/(c2max-c2min)
    return c2min + (t - c1min) * (c2max - c2min) / (c1max - c1min);
  }

  function debounce(idle, action) {
    var last = void 0;
    return function () {
      var ctx = this,
          args = arguments;
      clearTimeout(last);
      last = setTimeout(function () {
        action.apply(ctx, args);
      }, idle);
    };
  }

  function getWindowWidth() {
    return window.innerWidth || document.documentElement.clientWidth;
  }

  function rand(seed) {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
  }

  function getRandColor(seed) {
    var colorBuilder = function colorBuilder(colorSeed) {
      return coordinateTrans(rand(colorSeed), [0, 1], [80, 160]).toFixed();
    };
    var color = {
      r: colorBuilder(seed),
      g: colorBuilder(seed * 2),
      b: colorBuilder(seed * 3)
    };
    return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
  }

  try {
    module.exports = responsive;
  } catch (e) {
    if (window.ylResponse === undefined) {
      window.ylResponse = responsive;
    }
  }
})();