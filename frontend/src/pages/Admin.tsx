import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { winesApi } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import WineSearch from '../components/WineSearch';
import { useToastContext } from '../App';
import type { WineListItem, WineType, CreateWinePayload, VinmonopoletWine } from '../types';

const wineTypeColors: Record<WineType, string> = {
  red: 'bg-red-500',
  white: 'bg-yellow-200',
  rose: 'bg-pink-300',
  sparkling: 'bg-amber-100',
  dessert: 'bg-amber-400',
  fortified: 'bg-amber-700',
};

const wineTypeLabels: Record<WineType, string> = {
  red: 'Rødvin',
  white: 'Hvitvin',
  rose: 'Rosévin',
  sparkling: 'Musserende',
  dessert: 'Dessertvin',
  fortified: 'Sterkvin',
};

const emptyWine: CreateWinePayload = {
  name: '',
  producer: '',
  wine_type: 'red',
  country: '',
  region: '',
  vintage: null,
  grape_variety: '',
  price: null,
  description: '',
};

function Admin() {
  const [wines, setWines] = useState<WineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateWinePayload>(emptyWine);
  const [deletingWine, setDeletingWine] = useState<WineListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const toast = useToastContext();

  const loadWines = useCallback(async () => {
    try {
      const data = await winesApi.list({ includeInactive: true });
      setWines(data);
    } catch (err) {
      toast.error('Kunne ikke laste viner');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadWines();
  }, [loadWines]);

  const handleEdit = async (id: number) => {
    try {
      const wine = await winesApi.get(id);
      setFormData({
        name: wine.name,
        producer: wine.producer,
        wine_type: wine.wine_type,
        country: wine.country,
        region: wine.region,
        vintage: wine.vintage,
        grape_variety: wine.grape_variety,
        price: wine.price,
        description: wine.description,
        is_active: wine.is_active,
      });
      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      toast.error('Kunne ikke laste vindetaljer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vinnavn er påkrevd');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await winesApi.update(editingId, formData);
        toast.success('Vin oppdatert');
      } else {
        await winesApi.create(formData);
        toast.success('Vin lagt til');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyWine);
      loadWines();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kunne ikke lagre vin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWine) return;
    try {
      await winesApi.delete(deletingWine.id);
      toast.success('Vin slettet');
      loadWines();
    } catch (err) {
      toast.error('Kunne ikke slette vin');
    } finally {
      setDeletingWine(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyWine);
  };

  const handleSelectFromSearch = (wine: VinmonopoletWine) => {
    // Pre-fill the form with data from Vinmonopolet
    setFormData({
      name: wine.name,
      producer: wine.producer,
      wine_type: wine.wine_type,
      country: wine.country,
      region: wine.region,
      vintage: wine.vintage,
      grape_variety: wine.grape_variety,
      price: wine.price,
      description: wine.description,
      image_url: wine.image_url || undefined,
      vinmonopolet_id: wine.vinmonopolet_id,
    });
    setShowSearch(false);
    setShowForm(true);
    toast.success('Vindetaljer lastet - se over og lagre');
  };

  return (
    <div className="space-y-10">
      {/* Header with wine rack icon */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 8 8 8 13c0 4 2.5 7 4 7s4-3 4-7c0-5-4-11-4-11z" />
              <path d="M12 20v2M10 22h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            {/* Animated shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-apple-black dark:text-white tracking-tight">
              Vinkjeller
            </h1>
            <p className="text-apple-gray mt-1 text-lg">
              Administrer viner tilgjengelig for lotteri
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSearch(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Søk i Vinmonopolet
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Legg til manuelt
          </button>
        </div>
      </div>

      {/* Vinmonopolet Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <WineSearch
            onSelectWine={handleSelectFromSearch}
            onClose={() => setShowSearch(false)}
          />
        )}
      </AnimatePresence>

      {/* Wine Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <form onSubmit={handleSubmit} className="card p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold text-apple-black dark:text-white mb-6">
                  {editingId ? 'Rediger vin' : 'Legg til ny vin'}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Navn *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="f.eks. Barolo Riserva"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Produsent</label>
                    <input
                      type="text"
                      value={formData.producer}
                      onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                      className="input"
                      placeholder="f.eks. Fontanafredda"
                    />
                  </div>

                  <div>
                    <label className="label">Type *</label>
                    <select
                      value={formData.wine_type}
                      onChange={(e) => setFormData({ ...formData, wine_type: e.target.value as WineType })}
                      className="select"
                    >
                      {Object.entries(wineTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Land</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="input"
                      placeholder="f.eks. Italia"
                    />
                  </div>

                  <div>
                    <label className="label">Region</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="input"
                      placeholder="f.eks. Piemonte"
                    />
                  </div>

                  <div>
                    <label className="label">Årgang</label>
                    <input
                      type="number"
                      value={formData.vintage || ''}
                      onChange={(e) => setFormData({ ...formData, vintage: e.target.value ? parseInt(e.target.value) : null })}
                      className="input"
                      placeholder="f.eks. 2019"
                      min={1900}
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="label">Druetype</label>
                    <input
                      type="text"
                      value={formData.grape_variety}
                      onChange={(e) => setFormData({ ...formData, grape_variety: e.target.value })}
                      className="input"
                      placeholder="f.eks. Nebbiolo"
                    />
                  </div>

                  <div>
                    <label className="label">Pris (NOK)</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="input"
                      placeholder="f.eks. 499.90"
                      min={0}
                      step={0.01}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label">Beskrivelse</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="textarea"
                      rows={3}
                      placeholder="Smaksnotater, matkombinasjoner..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">
                    Avbryt
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Lagrer...' : editingId ? 'Oppdater vin' : 'Legg til vin'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wine List */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-apple-gray" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : wines.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-apple-lightgray dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-apple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C12 2 8 8 8 13c0 4 2.5 7 4 7s4-3 4-7c0-5-4-11-4-11z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20v2M10 22h4" />
            </svg>
          </div>
          <p className="text-apple-black dark:text-white font-medium">Ingen viner ennå</p>
          <p className="text-sm text-apple-gray mt-1">Legg til din første vin for å komme i gang</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wines.map((wine, index) => (
            <motion.div
              key={wine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 ${wineTypeColors[wine.wine_type]}`} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-apple-black dark:text-white truncate">
                      {wine.display_name}
                    </h3>
                    {wine.producer && (
                      <p className="text-sm text-apple-gray truncate">{wine.producer}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-apple-lightgray dark:bg-gray-800 text-apple-gray flex-shrink-0">
                  {wineTypeLabels[wine.wine_type]}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleEdit(wine.id)}
                  className="flex-1 btn btn-secondary text-sm py-2"
                >
                  Rediger
                </button>
                <button
                  onClick={() => setDeletingWine(wine)}
                  className="p-2 text-apple-gray hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deletingWine}
        title="Slette vin?"
        message={`Er du sikker på at du vil slette "${deletingWine?.display_name}"? Denne handlingen kan ikke angres.`}
        confirmText="Slett"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingWine(null)}
      />
    </div>
  );
}

export default Admin;
