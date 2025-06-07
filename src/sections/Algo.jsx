import InfiniteMenu from "../components/InfiniteMenu";

const Algo = () => {
    const items = [
        {
            image: 'https://picsum.photos/300/300?grayscale',
            link: 'https://google.com/',
            title: 'Demcus',
            description: 'This is pretty cool, right?'
        },
        {
            image: 'https://picsum.photos/400/400?grayscale',
            link: 'https://google.com/',
            title: 'ConvTasNet',
            description: 'This is pretty cool, right?'
        },
        {
            image: 'https://picsum.photos/500/500?grayscale',
            link: 'https://google.com/',
            title: 'Item 3',
            description: 'This is pretty cool, right?'
        },
        {
            image: 'https://picsum.photos/600/600?grayscale',
            link: 'https://google.com/',
            title: 'Item 4',
            description: 'This is pretty cool, right?'
        }
    ];

    return (
        <div className="c-space max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="algo" style={{ height: '600px', position: 'relative' }}>
            <InfiniteMenu items={items}/>
        </div>
        </div>
    );
};

export default Algo;