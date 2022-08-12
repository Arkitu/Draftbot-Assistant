declare module 'chart.js-image' {
    import ChartJSImage from 'chart.js-image';

    ChartJSImage.prototype.toFile = (file: string) => Promise<void>;

    export default ChartJSImage;
}