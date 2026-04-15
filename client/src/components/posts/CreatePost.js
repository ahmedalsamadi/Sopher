import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addPost } from '../../slices/postSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    document.title = 'Create Post | Sopher';
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !image) {
      toast.error('Please write something or add an image');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('text', text);
    if (image) {
      formData.append('image', image);
    }

    try {
      await dispatch(addPost(formData)).unwrap();
      toast.success('Post created successfully!');
      navigate('/feed');
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="create-post-page">
      <div className="create-post-content">
        <div className="create-post-card">
          <h1 className="create-post-title">Create Post</h1>
          <p className="create-post-subtitle">Share your thoughts with the community</p>

          <form onSubmit={handleSubmit} className="create-post-form">
            {/* Text Input */}
            <div className="form-group">
              <textarea
                id="post-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                rows="5"
                className="post-textarea"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="create-post-actions">
              <div className="post-attachments">
                <button
                  type="button"
                  className="attachment-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  🖼️ Add Image
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || (!text.trim() && !image)}
              >
                {submitting ? 'Posting...' : '✨ Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreatePost;
