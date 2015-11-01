;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.labels');

  function fillColoredText(ctx, str, x, y){
    for(var i = 0; i < str.length; ++i){
      var ch = str[i].text.toString();


      ctx.fillStyle = str[i].color;
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width;
    }
  }

  /**
   * This label renderer will display the label of the node
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   * @param  {object?}                  infos    The batch infos.
   */
  sigma.canvas.labels.def = function(node, context, settings, infos) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'] || 1,
        fontStyle = settings('fontStyle'),
        borderSize = settings('borderSize'),
        labelWidth,
        labelOffsetX,
        labelOffsetY,
        alignment = node.labelAlignment || settings('labelAlignment'),
        coloredLabel = node.coloredLabel;



    if (size < settings('labelThreshold'))
      return;

    // coloredLabel post processing to get full text and normalize it

    if(typeof coloredLabel == 'string') {
      coloredLabel = { text: coloredLabel }
    }

    if(coloredLabel && !(coloredLabel instanceof Array)) {
      coloredLabel = [coloredLabel];
    }

    var labelText = '';

    if (coloredLabel instanceof Array) {
      coloredLabel = coloredLabel.map(function(el) {
        var newEl = {text: el.text, color: el.color};

        if (typeof el == 'string') {
          newEl.text = el;
        }

        labelText += newEl.text;
        return newEl;
      });
    }


    if(labelText.length > 0) {
      node.label = labelText;
    }

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    var new_font = (fontStyle ? fontStyle + ' ' : '') +
      fontSize + 'px ' +
      (node.active ?
        settings('activeFont') || settings('font') :
        settings('font'));

    if (infos && infos.ctx.font != new_font) { //use font value caching
      context.font = new_font;
      infos.ctx.font = new_font;
    } else {
      context.font = new_font;
    }

    context.fillStyle =
        (settings('labelColor') === 'node') ?
        node.color || settings('defaultNodeColor') :
            settings('defaultLabelColor');

    // color postprocessing of coloredLabel to inject default color
    coloredLabel = coloredLabel.map(function(el) {
      var newEl = {text: el.text, color: el.color};

      if(!newEl.color) {
        newEl.color = context.fillStyle;
      }

      return newEl;
    });

    labelOffsetX = 0;
    labelOffsetY = fontSize / 3;
    context.textAlign = 'center';

    switch (alignment) {
      case 'bottom':
        labelOffsetY = + size + 4 * fontSize / 3;
        break;
      case 'center':
        break;
      case 'left':
        context.textAlign = 'right';
        labelOffsetX = - size - borderSize - 3;
        break;
      case 'top':
        labelOffsetY = - size - 2 * fontSize / 3;
        break;
      case 'inside':
        labelWidth = sigma.utils.canvas.getTextWidth(context,
            settings('approximateLabelWidth'), fontSize, node.label);
        if (labelWidth <= (size + fontSize / 3) * 2) {
          break;
        }
      /* falls through*/
      case 'right':
      /* falls through*/
      default:
        labelOffsetX = size + borderSize + 3;
        context.textAlign = 'left';
        break;
    }

    var labelX = Math.round(node[prefix + 'x'] + labelOffsetX);
    var labelY = Math.round(node[prefix + 'y'] + labelOffsetY);

    if(coloredLabel instanceof Array) {
      fillColoredText(context, coloredLabel, labelX, labelY);
    } else {
      context.fillText(node.label, labelX, labelY);
    }
  };
}).call(this);
