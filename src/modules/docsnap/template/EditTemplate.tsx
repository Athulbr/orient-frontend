import { ImageViewer } from './components/ImageViewer';

interface UpdateTemplatePageIF {
  test?: string;
}

const UpdateTemplatePage: React.FC<UpdateTemplatePageIF> = () => {
  const sampleImages = [
    'https://media.istockphoto.com/id/2065674519/photo/rolling-says-macro.jpg?s=2048x2048&w=is&k=20&c=FO-u3p_njEoIh7GusFYgrOo1RxF0EXobx0BXH6vMB4Q=',
    'https://media.istockphoto.com/id/2161390438/photo/legal-liability-concept-law-books-and-magnifying-glass.jpg?s=2048x2048&w=is&k=20&c=rNwGfRcOJTz-tVNbGk2q70fZkv7qCdMG_58shcc1zyA=',
    'https://media.istockphoto.com/id/2065674519/photo/rolling-says-macro.jpg?s=2048x2048&w=is&k=20&c=FO-u3p_njEoIh7GusFYgrOo1RxF0EXobx0BXH6vMB4Q=',
    'https://media.istockphoto.com/id/2161390438/photo/legal-liability-concept-law-books-and-magnifying-glass.jpg?s=2048x2048&w=is&k=20&c=rNwGfRcOJTz-tVNbGk2q70fZkv7qCdMG_58shcc1zyA=',
  ];
  return (
    <div className="">
      <div className="">
        <ImageViewer images={sampleImages} />
      </div>
    </div>
  );
};

export default UpdateTemplatePage;
