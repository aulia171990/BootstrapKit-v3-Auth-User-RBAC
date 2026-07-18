<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;

class ApiScope extends Model
{
    protected $fillable = ['code', 'name', 'module', 'description'];
}
