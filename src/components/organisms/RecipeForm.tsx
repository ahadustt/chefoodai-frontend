// Recipe creation/editing form with React Hook Form and Zod validation
import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { cn } from '@/utils/cn';
import type { Recipe, RecipeFormData } from '@/types';

// Zod validation schema
const recipeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Ingredient name is required'),
        quantity: z.number().min(0.1, 'Quantity must be positive'),
        unit: z.string().min(1, 'Unit is required'),
        notes: z.string().optional(),
        isOptional: z.boolean().default(false),
        substitutes: z.array(z.string()).optional(),
      })
    )
    .min(1, 'At least one ingredient is required'),
  instructions: z
    .array(
      z.object({
        stepNumber: z.number().min(1),
        text: z.string().min(1, 'Instruction text is required'),
        duration: z.number().min(0).optional(),
        imageUrl: z.string().url().optional().or(z.literal('')),
        tips: z.array(z.string()).optional(),
      })
    )
    .min(1, 'At least one instruction is required'),
  prepTime: z.number().min(1, 'Prep time must be at least 1 minute'),
  cookTime: z.number().min(0, 'Cook time cannot be negative'),
  servings: z.number().min(1, 'Must serve at least 1 person'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  cuisine: z.string().min(1, 'Cuisine is required'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const RecipeForm = ({
  recipe,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: RecipeFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: recipe?.title || '',
      description: recipe?.description || '',
      ingredients: recipe?.ingredients?.map((ing, index) => ({
        ...ing,
        stepNumber: index + 1,
      })) || [{ name: '', quantity: 1, unit: '', notes: '', isOptional: false }],
      instructions: recipe?.instructions || [{ stepNumber: 1, text: '', duration: 0, tips: [] }],
      prepTime: recipe?.prepTime || 15,
      cookTime: recipe?.cookTime || 30,
      servings: recipe?.servings || 4,
      difficulty: recipe?.difficulty || 'easy',
      cuisine: recipe?.cuisine || '',
      tags: recipe?.tags || [],
    },
    mode: 'onChange',
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: 'instructions',
  });

  // Tag management
  const [tagInput, setTagInput] = useState('');
  const watchedTags = watch('tags');

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  // Auto-update step numbers
  useEffect(() => {
    instructionFields.forEach((_, index) => {
      setValue(`instructions.${index}.stepNumber`, index + 1);
    });
  }, [instructionFields.length, setValue]);

  const onFormSubmit = (data: RecipeFormValues) => {
    onSubmit(data);
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className={cn('space-y-8', className)}
      noValidate
    >
      {/* Basic Information */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('title')}
            label="Recipe Title"
            placeholder="Enter recipe title"
            errorMessage={errors.title?.message}
            required
            showValidationIcon
          />
          
          <Input
            {...register('cuisine')}
            label="Cuisine Type"
            placeholder="e.g., Italian, Chinese, Mexican"
            errorMessage={errors.cuisine?.message}
            required
            showValidationIcon
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className={cn(
              'w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              errors.description 
                ? 'border-red-500 focus-visible:ring-red-600' 
                : 'border-gray-300 focus-visible:ring-primary-600'
            )}
            placeholder="Describe your recipe..."
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            {...register('prepTime', { valueAsNumber: true })}
            type="number"
            label="Prep Time (min)"
            min="1"
            errorMessage={errors.prepTime?.message}
            required
          />
          
          <Input
            {...register('cookTime', { valueAsNumber: true })}
            type="number"
            label="Cook Time (min)"
            min="0"
            errorMessage={errors.cookTime?.message}
            required
          />
          
          <Input
            {...register('servings', { valueAsNumber: true })}
            type="number"
            label="Servings"
            min="1"
            errorMessage={errors.servings?.message}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              {...register('difficulty')}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                errors.difficulty 
                  ? 'border-red-500 focus-visible:ring-red-600' 
                  : 'border-gray-300 focus-visible:ring-primary-600'
              )}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.difficulty.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIngredient({ 
              name: '', 
              quantity: 1, 
              unit: '', 
              notes: '', 
              isOptional: false 
            })}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-3">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1">
                <div className="md:col-span-2">
                  <Input
                    {...register(`ingredients.${index}.name`)}
                    placeholder="Ingredient name"
                    errorMessage={errors.ingredients?.[index]?.name?.message}
                    size="sm"
                  />
                </div>
                
                <Input
                  {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Qty"
                  errorMessage={errors.ingredients?.[index]?.quantity?.message}
                  size="sm"
                />
                
                <Input
                  {...register(`ingredients.${index}.unit`)}
                  placeholder="Unit"
                  errorMessage={errors.ingredients?.[index]?.unit?.message}
                  size="sm"
                />
                
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`ingredients.${index}.isOptional`}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        Optional
                      </label>
                    )}
                  />
                </div>
              </div>
              
              {ingredientFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700 mt-1"
                  ariaLabel={`Remove ingredient ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {errors.ingredients && (
          <p className="text-sm text-red-600" role="alert">
            {errors.ingredients.message}
          </p>
        )}
      </section>

      {/* Instructions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Instructions</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendInstruction({ 
              stepNumber: instructionFields.length + 1, 
              text: '', 
              duration: 0,
              tips: []
            })}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Step
          </Button>
        </div>

        <div className="space-y-4">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 p-4 border border-gray-200 rounded-md">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instruction <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register(`instructions.${index}.text`)}
                    rows={2}
                    className={cn(
                      'w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      errors.instructions?.[index]?.text 
                        ? 'border-red-500 focus-visible:ring-red-600' 
                        : 'border-gray-300 focus-visible:ring-primary-600'
                    )}
                    placeholder="Describe this step..."
                  />
                  {errors.instructions?.[index]?.text && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.instructions[index]?.text?.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    {...register(`instructions.${index}.duration`, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="Duration (optional)"
                    label="Duration (minutes)"
                    size="sm"
                  />
                  
                  <Input
                    {...register(`instructions.${index}.imageUrl`)}
                    type="url"
                    placeholder="Step image URL (optional)"
                    label="Image URL"
                    size="sm"
                  />
                </div>
              </div>
              
              {instructionFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700"
                  ariaLabel={`Remove step ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {errors.instructions && (
          <p className="text-sm text-red-600" role="alert">
            {errors.instructions.message}
          </p>
        )}
      </section>

      {/* Tags */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {watchedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-900"
                aria-label={`Remove tag ${tag}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={!tagInput.trim() || watchedTags.length >= 10}
          >
            Add Tag
          </Button>
        </div>
        
        {watchedTags.length >= 10 && (
          <p className="text-sm text-amber-600">
            Maximum 10 tags allowed
          </p>
        )}
      </section>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={isLoading}
          disabled={!isValid || !isDirty}
          className="sm:order-2"
        >
          {recipe ? 'Update Recipe' : 'Create Recipe'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="sm:order-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};