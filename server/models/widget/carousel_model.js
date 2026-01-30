const { mongoose } = require("mongoose");
const Widget = require("./base_model");

const Carousel = Widget.discriminator('Carousel', new mongoose.Schema({
    layout: {
      type: String,
      enum: ["Slider", "Story", "Gallery"],
      requird: true,
    },

    carouselSettings: {
        navigation: {
            showNavigation: { type: Boolean, default: true },
            showDots: { type: Boolean, default: true },
            navColor: { type: String, default: '#000000' },
            baseColor: { type: String, default: '#EF4444' },
            highlightColor: { type: String, default: "#171717" }
        },

        header: {
            show: { type: Boolean, default: true },
            text: { type: String, default: '' },
            fontSize: { type: Number, default: 24, min: 12 },
            fontWeight: {
                type: String,
                enum: ['normal', 'bold', '300', '400', '500', '600', '700', '800'],
                default: 'bold'
            },
            alignment: {
                type: Number,
                default: 20,
                min: 0,
                max: 90
            },
            isGradient: { type: Boolean, default: false },
        },

        modal: {
            isAutoPlay: { type: Boolean, default: false },
            autoPlayInterval: { type: Number, default: 3000 },
            ctaText: { type: String, default: "Buy Now" },
            ctaColor: { type: String, default: '#000' },
            ctaTextColor: { type: String, default: "#fff" }
        },

        description: {
            show: { type: Boolean, default: false },
            text: { type: String, default: '' },
            fontSize: { type: Number, default: 16, min: 12 },
            fontWeight: {
                type: String,
                enum: ['normal', 'bold', '300', '400', '500', '600', '700', '800'],
                default: 'normal'
            },
            color: { type: String, default: '#666666' },
            alignment: {
                type: Number,
                default: 20,
                min: 0,
                max: 90
            },
            marginTop: { type: Number, default: 10, min: 0 },
            marginBottom: { type: Number, default: 15, min: 0 },
            maxWidth: { type: Number, default: 100, min: 10, max: 100 },
            lineHeight: { type: Number, default: 1.5, min: 1 },
        },

        cardSettings: {
            showProductInfo: {
                type: Boolean,
                default: true
            },
            hoverEffect: {
                type: String,
                enum: ['none', 'scale', 'lift', 'glow'],
                default: 'scale'
            },
            paddingTop: {
                type: Number,
                default: 0
            },
            paddingBottom: {
                type: Number,
                default: 0
            }
        },

        responsive: {
            mobile: {
                cardsNumber: { type: Number, default: 1 },
            },
            desktop: {
                cardsNumber: { type: Number, default: 4 },
            }
        },
    }

}));

module.exports = Carousel;