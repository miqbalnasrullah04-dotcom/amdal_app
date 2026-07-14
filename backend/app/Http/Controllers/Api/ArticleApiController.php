<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleApiController extends Controller
{
    public function index(Request $request)
    {
        $articles = Article::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->orderByDesc('published_at')
            ->when($request->filled('limit'), fn ($q) => $q->limit((int) $request->limit))
            ->get()
            ->map(fn (Article $a) => [
                'slug' => $a->slug,
                'title' => $a->title,
                'excerpt' => $a->excerpt,
                'thumbnail' => $a->thumbnail_url,
                'published_at' => optional($a->published_at)->format('Y-m-d'),
            ]);

        return response()->json($articles);
    }

    public function show(string $slug)
    {
        $article = Article::where('slug', $slug)->firstOrFail();

        return response()->json([
            'slug' => $article->slug,
            'title' => $article->title,
            'excerpt' => $article->excerpt,
            'content' => $article->content,
            'thumbnail' => $article->thumbnail_url,
            'published_at' => optional($article->published_at)->format('Y-m-d'),
        ]);
    }

    public function adminIndex()
    {
        return response()->json(Article::orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $article = Article::create($validator->validated());

        return response()->json($article, 201);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $article->update($validator->validated());

        return response()->json($article);
    }

    public function destroy($id)
    {
        Article::findOrFail($id)->delete();

        return response()->json(['message' => 'Artikel berhasil dihapus']);
    }
}
