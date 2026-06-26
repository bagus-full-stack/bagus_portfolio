import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Plus, MessageSquareQuote, Loader2 } from 'lucide-react';
import { Testimonial } from '../../types';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { toast } from 'sonner';

const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: '1', quote: 'Assami a transformé notre vision en une application robuste et évolutive. Sa maîtrise des technologies web et son sens du détail ont fait la différence sur notre projet.', authorName: 'Sophie Laurent', authorRole: 'CTO', authorCompany: 'TechVision', linkedinUrl: 'https://linkedin.com/in/example1', order: 0 },
  { id: '2', quote: 'Une collaboration exceptionnelle. Non seulement le code est propre et performant, mais la capacité d\'Assami à proposer des solutions innovantes en IA nous a fait gagner un temps précieux.', authorName: 'Marc Dubois', authorRole: 'Product Manager', authorCompany: 'AgroData', linkedinUrl: 'https://linkedin.com/in/example2', order: 1 }
];

function SortableItem({ id, testimonial, onEdit, onDelete }: { key?: string | number, id: string, testimonial: Testimonial, onEdit: (t: Testimonial) => void, onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-[#0B0F14] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
      <div {...attributes} {...listeners} className="cursor-grab text-text-muted hover:text-text-primary p-2">
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-space font-bold text-text-primary">{testimonial.authorName}</span>
          <span className="text-text-muted text-sm">{testimonial.authorRole} chez {testimonial.authorCompany}</span>
        </div>
        <p className="text-sm text-text-muted truncate">
          "{testimonial.quote.substring(0, 60)}{testimonial.quote.length > 60 ? '...' : ''}"
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(testimonial)}
          className="p-2 text-text-muted hover:text-accent-cyan transition-colors"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="p-2 text-text-muted hover:text-[#EF4444] transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export function EditTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setTimeout(() => {
      setItems(MOCK_TESTIMONIALS);
      setLoading(false);
    }, 500);
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item: Testimonial, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleAddNew = () => {
    setFormData({
      quote: '',
      authorName: '',
      authorRole: '',
      authorCompany: '',
      linkedinUrl: ''
    });
    setEditingId('new');
  };

  const handleEdit = (item: Testimonial) => {
    setFormData(item);
    setEditingId(item.id);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = () => {
    if (deletingId) {
      setItems(items.filter(i => i.id !== deletingId));
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    setSavingState('saving');
    try {
      await new Promise(r => setTimeout(r, 600));
      if (editingId === 'new') {
        const newItem: Testimonial = {
          id: Date.now().toString(),
          quote: formData.quote || '',
          authorName: formData.authorName || '',
          authorRole: formData.authorRole || '',
          authorCompany: formData.authorCompany || '',
          linkedinUrl: formData.linkedinUrl || '',
          order: items.length
        };
        setItems([...items, newItem]);
      } else {
        setItems(items.map(i => i.id === editingId ? { ...i, ...formData } as Testimonial : i));
      }
      setEditingId(null);
      setSavingState('success');
      toast.success('Modifications enregistrées');
      setTimeout(() => setSavingState('idle'), 2000);
    } catch (err) {
      setSavingState('error');
      toast.error('Échec — Réessayer');
      setTimeout(() => setSavingState('idle'), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-ocre/10 flex items-center justify-center text-accent-ocre">
            <MessageSquareQuote size={20} />
          </div>
          <h1 className="font-space text-3xl font-bold text-text-primary">Témoignages</h1>
        </div>
        <button 
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center gap-2 px-4 py-2 bg-accent-ocre text-bg-primary font-space font-medium rounded-lg hover:bg-accent-ocre/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {editingId && (
        <div className="bg-bg-card border border-[#E08A3E]/30 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="font-space font-bold text-xl mb-6">
            {editingId === 'new' ? 'Nouveau témoignage' : 'Éditer le témoignage'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Citation *</label>
              <textarea 
                value={formData.quote || ''}
                onChange={e => setFormData({...formData, quote: e.target.value})}
                maxLength={280}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:border-accent-ocre/50 focus:outline-none min-h-[100px]"
                placeholder="Message du client..."
              />
              <div className="text-right text-xs text-text-muted mt-1">
                {(formData.quote || '').length}/280
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Nom complet *</label>
                <input 
                  type="text"
                  value={formData.authorName || ''}
                  onChange={e => setFormData({...formData, authorName: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:border-accent-ocre/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Poste *</label>
                <input 
                  type="text"
                  value={formData.authorRole || ''}
                  onChange={e => setFormData({...formData, authorRole: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:border-accent-ocre/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Entreprise *</label>
                <input 
                  type="text"
                  value={formData.authorCompany || ''}
                  onChange={e => setFormData({...formData, authorCompany: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:border-accent-ocre/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">URL LinkedIn *</label>
                <input 
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={e => setFormData({...formData, linkedinUrl: e.target.value})}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:border-accent-ocre/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="sticky bottom-4 z-50 bg-[#0B0F14] pt-4 border-t border-[#9BA4B5]/20 flex justify-end gap-3">
              <button 
                onClick={() => setEditingId(null)}
                className="px-6 py-2.5 text-text-primary hover:bg-white/5 font-medium rounded transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.quote || !formData.authorName || !formData.authorRole || !formData.authorCompany || !formData.linkedinUrl || savingState === 'saving'}
                className="px-6 py-2.5 bg-[#E08A3E] text-[#0B0F14] font-medium rounded hover:bg-[#E08A3E]/90 transition-colors disabled:opacity-70 flex items-center"
              >
                {savingState === 'saving' && <Loader2 size={18} className="animate-spin mr-2" />}
                {savingState === 'saving' ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-bg-card rounded-xl border border-white/5 border-dashed">
          <MessageSquareQuote size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-text-muted mb-4">Aucun témoignage pour le moment</p>
          <button 
            onClick={handleAddNew}
            className="text-accent-ocre font-medium hover:underline"
          >
            Ajouter le premier témoignage
          </button>
        </div>
      ) : (
        <div className="bg-bg-card rounded-xl border border-white/5 p-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map(item => (
                  <SortableItem 
                    key={item.id} 
                    id={item.id} 
                    testimonial={item} 
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Confirmer la suppression"
        message="Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
