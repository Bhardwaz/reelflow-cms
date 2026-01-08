module.exports = {
    Media: require('./media/base_model'),
    Image: require('./media/image_model'),
    Video: require('./media/video_model'),

    // widgets
    Widget: require('./widget/base_model'),
    Carousel: require('./widget/carousel_model'),
    Story: require('./widget/story_model'),
    Pip: require('./widget/pip_model'),

    WidgetItem: require('./widgetItem')
}